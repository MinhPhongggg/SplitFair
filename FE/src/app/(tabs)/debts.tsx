import React, { useState, useMemo, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
  Alert,
  LayoutAnimation,
  Platform,
  UIManager,
  ScrollView,
  TextInput,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { router } from "expo-router";
import { useCurrentApp } from "@/context/app.context";
import {
  useGetAllDebtsByUser,
  useSettleDebt,
  useSettleBatchDebts,
} from "@/api/hooks";
import { markDebtAsSettled } from "@/api/debt";
import { APP_COLOR } from "@/utils/constant";
import Ionicons from "@expo/vector-icons/Ionicons";
import { Debt } from "@/types/debt.types";
import Avatar from "@/component/Avatar";
import { useToast } from "@/context/toast.context";
import { getAccountAPI } from "@/utils/api";
import AsyncStorage from "@react-native-async-storage/async-storage";
import Header from "@/component/Header";
import { format } from "date-fns";
import { vi } from "date-fns/locale";

if (Platform.OS === "android") {
  if (UIManager.setLayoutAnimationEnabledExperimental) {
    UIManager.setLayoutAnimationEnabledExperimental(true);
  }
}

type TabType = "PAYABLES" | "RECEIVABLES";

interface GroupedDebt {
  partnerId: string;
  partnerName: string;
  partnerAvatar?: string;
  totalAmount: number;
  debts: Debt[];
}

const DebtScreen = () => {
  const { appState, setAppState } = useCurrentApp();
  const { showToast } = useToast();
  const [activeTab, setActiveTab] = useState<TabType>("PAYABLES");
  const [expandedGroups, setExpandedGroups] = useState<Set<string>>(new Set());
  const [searchQuery, setSearchQuery] = useState("");

  // Tự động lấy lại thông tin user nếu bị mất state (F5/Reload)
  useEffect(() => {
    const restoreUser = async () => {
      if (!appState?.userId) {
        try {
          const token = await AsyncStorage.getItem("token");
          if (token) {
            const res = await getAccountAPI();
            if (res) {
              setAppState({ ...res, token });
            }
          }
        } catch (e) {
          console.log("Failed to restore user session", e);
        }
      }
    };
    restoreUser();
  }, [appState?.userId]);

  const userId = appState?.userId ? String(appState.userId) : "";
  const { data: allDebts, isLoading, refetch } = useGetAllDebtsByUser(userId);
  const { mutate: settleDebt } = useSettleDebt();
  const { mutate: settleBatchDebts } = useSettleBatchDebts();

  const { groupedPayables, groupedReceivables, overview, suggestions } =
    useMemo(() => {
      if (!allDebts)
        return {
          groupedPayables: [],
          groupedReceivables: [],
          overview: { pay: 0, rec: 0, net: 0 },
          suggestions: [],
        };

      const unsettled = allDebts.filter((d) => d.status === "UNSETTLED");

      const groupData = (items: Debt[], isPayable: boolean): GroupedDebt[] => {
        const map = new Map<string, GroupedDebt>();

        items.forEach((item) => {
          const partnerId = isPayable ? item.toUserId : item.fromUserId;
          const rawName = isPayable ? item.toUserName : item.fromUserName;
          const partnerName =
            rawName || `User ${partnerId?.substring(0, 5) ?? "Unknown"}`;
          const partnerAvatar = isPayable
            ? item.toUserAvatar
            : item.fromUserAvatar;

          // Filter by search query
          if (
            searchQuery &&
            !partnerName.toLowerCase().includes(searchQuery.toLowerCase())
          ) {
            return;
          }

          if (!map.has(partnerId)) {
            map.set(partnerId, {
              partnerId,
              partnerName,
              partnerAvatar,
              totalAmount: 0,
              debts: [],
            });
          }

          const group = map.get(partnerId)!;
          group.totalAmount += item.amount;
          group.debts.push(item);
        });

        return Array.from(map.values());
      };

      const pay = unsettled.filter((d) => d.fromUserId === userId);
      const receive = unsettled.filter((d) => d.toUserId === userId);

      const gPay = groupData(pay, true);
      const gRec = groupData(receive, false);

      const totalPay = gPay.reduce((sum, i) => sum + i.totalAmount, 0);
      const totalRec = gRec.reduce((sum, i) => sum + i.totalAmount, 0);

      // Smart Suggestions Logic
      const suggs: any[] = [];
      gPay.forEach((p) => {
        const r = gRec.find((x) => x.partnerId === p.partnerId);
        if (r) {
          const diff = r.totalAmount - p.totalAmount;
          if (diff !== 0) {
            suggs.push({
              partnerId: p.partnerId,
              partnerName: p.partnerName,
              payAmount: p.totalAmount,
              recAmount: r.totalAmount,
              netAmount: Math.abs(diff),
              action: diff > 0 ? "RECEIVE" : "PAY",
            });
          }
        }
      });

      return {
        groupedPayables: gPay,
        groupedReceivables: gRec,
        overview: { pay: totalPay, rec: totalRec, net: totalRec - totalPay },
        suggestions: suggs,
      };
    }, [allDebts, userId, searchQuery]);

  const handleSettle = (debt: Debt) => {
    Alert.alert(
      "Xác nhận",
      activeTab === "PAYABLES"
        ? "Đánh dấu khoản nợ này là ĐÃ TRẢ?"
        : "Xác nhận bạn ĐÃ NHẬN được tiền?",
      [
        { text: "Hủy", style: "cancel" },
        {
          text: "Đồng ý",
          onPress: () => {
            settleDebt(debt.id, {
              onSuccess: () =>
                showToast(
                  "success",
                  "Thành công",
                  "Đã cập nhật trạng thái nợ."
                ),
              onError: () => showToast("error", "Lỗi", "Không thể cập nhật."),
            });
          },
        },
      ]
    );
  };

  const handleSettleAll = (partnerId: string, debts: Debt[]) => {
    Alert.alert(
      "Trả tất cả",
      `Bạn có chắc muốn đánh dấu tất cả ${debts.length} khoản nợ với người này là ĐÃ XONG?`,
      [
        { text: "Hủy", style: "cancel" },
        {
          text: "Đồng ý",
          onPress: () => {
            const debtIds = debts.map((d) => d.id);
            settleBatchDebts(debtIds, {
              onSuccess: () => {
                showToast("success", "Thành công", "Đã xử lý tất cả khoản nợ.");
                refetch();
              },
              onError: () => {
                showToast("error", "Lỗi", "Có lỗi xảy ra khi xử lý.");
              },
            });
          },
        },
      ]
    );
  };

  const toggleExpand = (partnerId: string) => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setExpandedGroups((prev) => {
      const next = new Set(prev);
      if (next.has(partnerId)) {
        next.delete(partnerId);
      } else {
        next.add(partnerId);
      }
      return next;
    });
  };

  const renderOverview = () => (
    <View style={styles.overviewContainer}>
      <View style={styles.overviewCard}>
        {/* Top Section: Net Balance */}
        <View style={styles.netBalanceSection}>
          <Text style={styles.netLabel}>Tổng số dư</Text>
          <Text
            style={[
              styles.netValueBig,
              overview.net >= 0 ? styles.textGreen : styles.textRed,
            ]}
          >
            {overview.net > 0 ? "+" : ""}
            {overview.net.toLocaleString("vi-VN")} đ
          </Text>
        </View>

        {/* Divider */}
        <View style={styles.horizontalDivider} />

        {/* Bottom Section: Payables & Receivables */}
        <View style={styles.overviewRow}>
          <View style={styles.overviewItem}>
            <Text style={[styles.overviewValue, styles.textRed]}>
              {overview.pay.toLocaleString("vi-VN")} đ
            </Text>
            <Text style={styles.overviewLabel}>Phải trả</Text>
          </View>
          <View style={styles.verticalDivider} />
          <View style={styles.overviewItem}>
            <Text style={[styles.overviewValue, styles.textGreen]}>
              {overview.rec.toLocaleString("vi-VN")} đ
            </Text>
            <Text style={styles.overviewLabel}>Sẽ nhận</Text>
          </View>
        </View>
      </View>
    </View>
  );

  const renderSuggestions = () => {
    if (suggestions.length === 0) return null;
    return (
      <View style={styles.suggestionContainer}>
        <View style={styles.suggestionHeader}>
          <Ionicons name="bulb" size={20} color="#FFC107" />
          <Text style={styles.sectionTitle}>Gợi ý tối ưu nợ</Text>
        </View>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ paddingRight: 20 }}
        >
          {suggestions.map((s, index) => (
            <View key={index} style={styles.suggestionCard}>
              <View style={styles.suggestionIcon}>
                <Ionicons
                  name="swap-horizontal"
                  size={24}
                  color={APP_COLOR.ORANGE}
                />
              </View>
              <View style={styles.suggestionContent}>
                <Text style={styles.suggestionText}>
                  Nợ chéo với{" "}
                  <Text style={{ fontWeight: "bold" }}>{s.partnerName}</Text>
                </Text>
                <Text style={styles.suggestionDetail}>
                  Thay vì trả {s.payAmount.toLocaleString()}đ & nhận{" "}
                  {s.recAmount.toLocaleString()}đ
                </Text>
                <View style={styles.suggestionActionContainer}>
                  <Text
                    style={[
                      styles.suggestionAction,
                      s.action === "RECEIVE"
                        ? styles.textGreen
                        : styles.textRed,
                    ]}
                  >
                    {s.action === "RECEIVE" ? "NHẬN" : "TRẢ"}{" "}
                    {s.netAmount.toLocaleString()} đ
                  </Text>
                </View>
              </View>
            </View>
          ))}
        </ScrollView>
      </View>
    );
  };

  const renderGroupItem = ({ item }: { item: GroupedDebt }) => {
    const isExpanded = expandedGroups.has(item.partnerId);
    const isPayable = activeTab === "PAYABLES";
    const totalGlobal = isPayable ? overview.pay : overview.rec;
    const percentage =
      totalGlobal > 0 ? (item.totalAmount / totalGlobal) * 100 : 0;

    // Group debts by groupName
    const debtsByGroup: Record<string, Debt[]> = {};
    item.debts.forEach((d) => {
      const gName = d.groupName || "Cá nhân";
      if (!debtsByGroup[gName]) debtsByGroup[gName] = [];
      debtsByGroup[gName].push(d);
    });

    return (
      <View style={styles.groupCard}>
        <TouchableOpacity
          style={styles.groupHeader}
          onPress={() => toggleExpand(item.partnerId)}
          activeOpacity={0.7}
        >
          <View style={styles.headerLeft}>
            <Avatar
              avatar={item.partnerAvatar}
              name={item.partnerName}
              size={45}
            />
            <View style={styles.userInfo}>
              <Text style={styles.userName}>{item.partnerName}</Text>
              <View style={styles.progressBarContainer}>
                <View
                  style={[
                    styles.progressBarFill,
                    {
                      width: `${percentage}%`,
                      backgroundColor: isPayable ? "#FF453A" : "#32D74B",
                    },
                  ]}
                />
              </View>
              <Text style={styles.debtCount}>
                {item.debts.length} khoản nợ • {percentage.toFixed(1)}% tổng nợ
              </Text>
            </View>
          </View>
          <View style={styles.headerRight}>
            <Text
              style={[
                styles.totalAmount,
                isPayable ? styles.textRed : styles.textGreen,
              ]}
            >
              {item.totalAmount.toLocaleString("vi-VN")} đ
            </Text>
            <Ionicons
              name={isExpanded ? "chevron-up" : "chevron-down"}
              size={20}
              color="#999"
            />
          </View>
        </TouchableOpacity>

        {isExpanded && (
          <View style={styles.debtList}>
            <View style={styles.actionRow}>
              <TouchableOpacity
                style={styles.settleAllBtn}
                onPress={() => handleSettleAll(item.partnerId, item.debts)}
              >
                <Text style={styles.settleAllText}>
                  Thanh toán tất cả ({item.debts.length})
                </Text>
              </TouchableOpacity>
            </View>

            {Object.entries(debtsByGroup).map(([groupName, groupDebts]) => (
              <View key={groupName} style={styles.subGroupContainer}>
                <Text style={styles.subGroupTitle}>{groupName}</Text>
                {groupDebts.map((debt, index) => (
                  <TouchableOpacity
                    key={debt.id}
                    style={styles.debtItem}
                    onPress={() => {
                      if (debt.expenseId) {
                        router.push({
                          pathname: "/(tabs)/groups/expense/[expenseId]",
                          params: { expenseId: debt.expenseId },
                        });
                      }
                    }}
                  >
                    <View style={styles.debtInfo}>
                      <Text style={styles.debtDesc} numberOfLines={1}>
                        {debt.expenseDescription || "Khoản nợ"}
                      </Text>
                      <Text style={styles.debtDate}>
                        {debt.createdTime
                          ? format(
                              new Date(debt.createdTime),
                              "dd/MM/yyyy HH:mm",
                              { locale: vi }
                            )
                          : "Không có ngày"}
                      </Text>
                    </View>
                    <View style={styles.debtAction}>
                      <Text style={styles.debtAmount}>
                        {debt.amount.toLocaleString("vi-VN")} đ
                      </Text>
                      <View style={{ flexDirection: "row" }}>
                        {!isPayable && (
                          <TouchableOpacity
                            style={[styles.iconBtn, { marginRight: 8 }]}
                            onPress={() =>
                              showToast(
                                "info",
                                "Nhắc nợ",
                                `Đã gửi thông báo đến ${item.partnerName}`
                              )
                            }
                          >
                            <Ionicons
                              name="notifications-outline"
                              size={18}
                              color={APP_COLOR.ORANGE}
                            />
                          </TouchableOpacity>
                        )}
                        <TouchableOpacity
                          style={[
                            styles.settleBtn,
                            isPayable ? styles.btnOutline : styles.btnFill,
                          ]}
                          onPress={() => handleSettle(debt)}
                        >
                          <Text
                            style={[
                              styles.settleBtnText,
                              !isPayable && { color: "white" },
                            ]}
                          >
                            {isPayable ? "Trả" : "Nhận"}
                          </Text>
                        </TouchableOpacity>
                      </View>
                    </View>
                  </TouchableOpacity>
                ))}
              </View>
            ))}
          </View>
        )}
      </View>
    );
  };

  const currentData =
    activeTab === "PAYABLES" ? groupedPayables : groupedReceivables;

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <Header title="Quản lý nợ" />

      <FlatList
        data={currentData}
        keyExtractor={(item) => item.partnerId}
        renderItem={renderGroupItem}
        contentContainerStyle={styles.listContent}
        refreshControl={
          <RefreshControl refreshing={isLoading} onRefresh={refetch} />
        }
        ListHeaderComponent={
          <>
            <View style={styles.searchContainer}>
              <Ionicons name="search" size={20} color="#999" />
              <TextInput
                style={styles.searchInput}
                placeholder="Tìm kiếm theo tên..."
                value={searchQuery}
                onChangeText={setSearchQuery}
                placeholderTextColor="#999"
              />
              {searchQuery.length > 0 && (
                <TouchableOpacity onPress={() => setSearchQuery("")}>
                  <Ionicons name="close-circle" size={18} color="#ccc" />
                </TouchableOpacity>
              )}
            </View>

            {renderOverview()}
            {renderSuggestions()}
            <View style={styles.tabsContainer}>
              <TouchableOpacity
                style={[
                  styles.tab,
                  activeTab === "PAYABLES" && styles.activeTab,
                ]}
                onPress={() => setActiveTab("PAYABLES")}
              >
                <Text
                  style={[
                    styles.tabText,
                    activeTab === "PAYABLES" && styles.activeTabText,
                  ]}
                >
                  Phải trả ({groupedPayables.length})
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  styles.tab,
                  activeTab === "RECEIVABLES" && styles.activeTab,
                ]}
                onPress={() => setActiveTab("RECEIVABLES")}
              >
                <Text
                  style={[
                    styles.tabText,
                    activeTab === "RECEIVABLES" && styles.activeTabText,
                  ]}
                >
                  Sẽ nhận ({groupedReceivables.length})
                </Text>
              </TouchableOpacity>
            </View>
          </>
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Ionicons
              name="checkmark-done-circle-outline"
              size={64}
              color="#ccc"
            />
            <Text style={styles.emptyText}>
              Tuyệt vời! Không có khoản nợ nào.
            </Text>
          </View>
        }
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F5F7FA" },

  // Search Bar
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "white",
    marginHorizontal: 15,
    marginTop: 10,
    marginBottom: 5,
    paddingHorizontal: 15,
    borderRadius: 12,
    height: 45,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  searchInput: {
    flex: 1,
    marginLeft: 10,
    fontSize: 15,
    color: "#333",
  },

  // Overview
  overviewContainer: { margin: 15, marginBottom: 5 },
  overviewCard: {
    backgroundColor: "white",
    borderRadius: 16,
    padding: 0, // Remove padding to handle dividers
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
    marginBottom: 10,
    overflow: "hidden",
  },
  netBalanceSection: {
    alignItems: "center",
    paddingVertical: 20,
    backgroundColor: "#fff",
  },
  netLabel: { fontSize: 14, color: "#888", marginBottom: 5 },
  netValueBig: { fontSize: 32, fontWeight: "bold" },

  horizontalDivider: { height: 1, backgroundColor: "#f0f0f0", width: "100%" },

  overviewRow: { flexDirection: "row", height: 80 },
  overviewItem: { flex: 1, alignItems: "center", justifyContent: "center" },
  verticalDivider: { width: 1, height: "100%", backgroundColor: "#f0f0f0" },

  overviewValue: { fontSize: 16, fontWeight: "bold", marginBottom: 4 },
  overviewLabel: { fontSize: 13, color: "#888", fontWeight: "500" },

  // Suggestions
  suggestionContainer: { marginVertical: 15, paddingLeft: 15 },
  suggestionHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 10,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#333",
    marginLeft: 8,
  },

  suggestionCard: {
    backgroundColor: "white",
    borderRadius: 12,
    marginRight: 12,
    width: 280,
    padding: 12,
    flexDirection: "row",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
    borderWidth: 1,
    borderColor: "#f0f0f0",
  },
  suggestionIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#FFF3E0",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  suggestionContent: { flex: 1 },
  suggestionText: { fontSize: 14, color: "#333", marginBottom: 4 },
  suggestionDetail: { fontSize: 12, color: "#888", marginBottom: 8 },
  suggestionActionContainer: {
    alignSelf: "flex-start",
    backgroundColor: "#F5F7FA",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  suggestionAction: { fontSize: 13, fontWeight: "bold" },

  tabsContainer: {
    flexDirection: "row",
    marginHorizontal: 15,
    marginBottom: 10,
    backgroundColor: "white",
    borderRadius: 12,
    padding: 4,
  },
  tab: { flex: 1, paddingVertical: 10, alignItems: "center", borderRadius: 8 },
  activeTab: { backgroundColor: APP_COLOR.ORANGE },
  tabText: { fontWeight: "600", color: "#666" },
  activeTabText: { color: "white" },

  center: { flex: 1, justifyContent: "center", alignItems: "center" },
  listContent: { paddingBottom: 20 },

  emptyContainer: { alignItems: "center", marginTop: 50 },
  emptyText: { marginTop: 10, color: "#888", fontSize: 16 },

  // Group Card Styles
  groupCard: {
    backgroundColor: "white",
    borderRadius: 12,
    marginHorizontal: 15,
    marginBottom: 12,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  groupHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 15,
  },
  headerLeft: { flexDirection: "row", alignItems: "center", flex: 1 },
  userInfo: { marginLeft: 12, flex: 1 },
  userName: { fontSize: 16, fontWeight: "600", color: "#333" },
  debtCount: { fontSize: 12, color: "#888", marginTop: 4 },
  headerRight: { alignItems: "flex-end", marginLeft: 10 },
  totalAmount: { fontSize: 16, fontWeight: "bold", marginBottom: 4 },

  progressBarContainer: {
    height: 4,
    backgroundColor: "#eee",
    borderRadius: 2,
    marginTop: 4,
    width: "80%",
  },
  progressBarFill: { height: "100%", borderRadius: 2 },

  // Debt List Styles
  debtList: {
    backgroundColor: "#FAFAFA",
    borderTopWidth: 1,
    borderTopColor: "#eee",
    paddingBottom: 10,
  },
  actionRow: { padding: 10, alignItems: "center" },
  settleAllBtn: {
    paddingVertical: 8,
    paddingHorizontal: 20,
    backgroundColor: "#E3F2FD",
    borderRadius: 20,
  },
  settleAllText: { color: "#2196F3", fontWeight: "600", fontSize: 13 },

  subGroupContainer: { marginTop: 10 },
  subGroupTitle: {
    fontSize: 13,
    fontWeight: "bold",
    color: "#666",
    marginLeft: 15,
    marginBottom: 5,
    textTransform: "uppercase",
  },

  debtItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 12,
    paddingHorizontal: 15,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
    backgroundColor: "white",
  },
  debtInfo: { flex: 1 },
  debtGroup: { fontSize: 14, color: "#444", marginBottom: 2 },
  debtDesc: { fontSize: 14, fontWeight: "500", color: "#333", marginBottom: 2 },
  debtDate: { fontSize: 12, color: "#999" },
  debtAction: { alignItems: "flex-end" },
  debtAmount: {
    fontSize: 14,
    fontWeight: "600",
    color: "#333",
    marginBottom: 6,
  },

  settleBtn: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
    borderWidth: 1,
  },
  iconBtn: { padding: 6 },
  btnOutline: { borderColor: APP_COLOR.ORANGE, backgroundColor: "white" },
  btnFill: { borderColor: APP_COLOR.GREEN, backgroundColor: APP_COLOR.GREEN },
  settleBtnText: { fontSize: 12, fontWeight: "600", color: APP_COLOR.ORANGE },

  textRed: { color: "#FF453A" },
  textGreen: { color: "#32D74B" },
});

export default DebtScreen;

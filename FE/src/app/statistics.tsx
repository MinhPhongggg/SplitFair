import React, { useEffect, useState, useMemo } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Dimensions,
} from "react-native";
import { Stack } from "expo-router";
import { useCurrentApp } from "@/context/app.context";
import { useGetGroups } from "@/api/hooks";
import { getExpensesByGroup, getSharesByUser } from "@/api/expense";
import { Expense, ExpenseShare } from "@/types/expense.types";
import { APP_COLOR } from "@/utils/constant";
import {
  format,
  subDays,
  parseISO,
  startOfWeek,
  endOfWeek,
  eachDayOfInterval,
  isSameDay,
  startOfMonth,
  endOfMonth,
  eachWeekOfInterval,
  isSameWeek,
  subWeeks,
  addWeeks,
  subMonths,
  addMonths,
} from "date-fns";
import { vi } from "date-fns/locale";
import Ionicons from "@expo/vector-icons/Ionicons";

const { width } = Dimensions.get("window");

const StatisticsScreen = () => {
  const { appState } = useCurrentApp();
  const userId = appState?.userId;
  const { data: groups } = useGetGroups();

  const [loading, setLoading] = useState(true);
  const [shares, setShares] = useState<ExpenseShare[]>([]);
  const [expensesMap, setExpensesMap] = useState<Record<string, Expense>>({});
  const [viewMode, setViewMode] = useState<"week" | "month">("week");
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedPoint, setSelectedPoint] = useState<{
    label: string;
    value: number;
  } | null>(null);

  const handlePrev = () => {
    if (viewMode === "week") {
      setCurrentDate((prev) => subWeeks(prev, 1));
    } else {
      setCurrentDate((prev) => subMonths(prev, 1));
    }
  };

  const handleNext = () => {
    if (viewMode === "week") {
      setCurrentDate((prev) => addWeeks(prev, 1));
    } else {
      setCurrentDate((prev) => addMonths(prev, 1));
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      if (!userId || !groups) return;
      setLoading(true);
      try {
        const userShares = await getSharesByUser(String(userId));
        setShares(userShares);

        const expensePromises = groups.map((g) => getExpensesByGroup(g.id));
        const expensesArrays = await Promise.all(expensePromises);
        const allExpenses = expensesArrays.flat();

        const map: Record<string, Expense> = {};
        allExpenses.forEach((e) => {
          map[e.id] = e;
        });
        setExpensesMap(map);
      } catch (error) {
        console.error("Error fetching stats data", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [userId, groups]);

  const statsData = useMemo(() => {
    if (!shares.length || Object.keys(expensesMap).length === 0)
      return { chart: [], total: 0, list: [], dateRangeLabel: "" };

    const validShares = shares.filter((s) => expensesMap[s.expenseId]);
    let chartData: { label: string; value: number; fullDate?: Date }[] = [];
    let filteredShares: any[] = [];
    let total = 0;
    let dateRangeLabel = "";

    if (viewMode === "week") {
      const start = startOfWeek(currentDate, { locale: vi, weekStartsOn: 1 }); // T2 là đầu tuần
      const end = endOfWeek(currentDate, { locale: vi, weekStartsOn: 1 });

      dateRangeLabel = `${format(start, "dd/MM")} - ${format(
        end,
        "dd/MM/yyyy"
      )}`;

      const days = eachDayOfInterval({ start, end });

      chartData = days.map((day) => {
        const dayShares = validShares.filter((s) => {
          const eDate = parseISO(expensesMap[s.expenseId].createdTime);
          return isSameDay(eDate, day);
        });
        const dayTotal = dayShares.reduce((sum, s) => sum + s.shareAmount, 0);
        return {
          label: format(day, "EE", { locale: vi }), // T2, T3...
          value: dayTotal,
          fullDate: day,
        };
      });

      filteredShares = validShares.filter((s) => {
        const eDate = parseISO(expensesMap[s.expenseId].createdTime);
        return eDate >= start && eDate <= end;
      });
    } else {
      const monthStart = startOfMonth(currentDate);
      const monthEnd = endOfMonth(currentDate);

      dateRangeLabel = format(currentDate, "MM/yyyy");

      // Start from the beginning of the week that contains the 1st of the month
      const startLoop = startOfWeek(monthStart, {
        locale: vi,
        weekStartsOn: 1,
      });
      const endLoop = endOfWeek(monthEnd, { locale: vi, weekStartsOn: 1 });

      const weeks = eachWeekOfInterval(
        { start: startLoop, end: endLoop },
        { locale: vi, weekStartsOn: 1 }
      );

      chartData = weeks.map((weekStart, index) => {
        const weekEnd = endOfWeek(weekStart, { locale: vi, weekStartsOn: 1 });

        // Adjust weekEnd if it goes beyond month end
        const actualEnd = weekEnd > monthEnd ? monthEnd : weekEnd;
        const actualStart = weekStart < monthStart ? monthStart : weekStart;

        // Skip if week is outside (should not happen with this loop but safe check)
        if (actualStart > actualEnd)
          return { label: `W${index + 1}`, value: 0 };

        const weekShares = validShares.filter((s) => {
          const eDate = parseISO(expensesMap[s.expenseId].createdTime);
          return eDate >= actualStart && eDate <= actualEnd;
        });
        const weekTotal = weekShares.reduce((sum, s) => sum + s.shareAmount, 0);
        return {
          label: `W${index + 1}`,
          value: weekTotal,
        };
      });

      filteredShares = validShares.filter((s) => {
        const eDate = parseISO(expensesMap[s.expenseId].createdTime);
        return eDate >= monthStart && eDate <= monthEnd;
      });
    }

    total = filteredShares.reduce((sum, s) => sum + s.shareAmount, 0);

    // Sort list by date desc
    const list = filteredShares
      .map((s) => ({
        ...s,
        expense: expensesMap[s.expenseId],
      }))
      .sort(
        (a, b) =>
          new Date(b.expense.createdTime).getTime() -
          new Date(a.expense.createdTime).getTime()
      );

    return { chart: chartData, total, list, dateRangeLabel };
  }, [shares, expensesMap, viewMode, currentDate]);

  useEffect(() => {
    setSelectedPoint(null);
  }, [viewMode, currentDate]);

  const maxChartValue = Math.max(...statsData.chart.map((d) => d.value), 1);

  const formatYLabel = (val: number) => {
    if (val >= 1000000) return `${(val / 1000000).toFixed(1)}M`;
    if (val >= 1000) return `${(val / 1000).toFixed(0)}k`;
    return Math.round(val).toString();
  };

  const formatTooltipValue = (val: number) => {
    if (val >= 1000000) return `${(val / 1000000).toFixed(2)}M`;
    if (val >= 1000) return `${(val / 1000).toFixed(1)}k`;
    return Math.round(val).toString();
  };

  return (
    <View style={styles.container}>
      <Stack.Screen
        options={{ title: "Thống kê chi tiêu", headerBackTitle: "Trở về" }}
      />

      {/* Filter Tabs */}
      <View style={styles.tabContainer}>
        <TouchableOpacity
          style={[styles.tab, viewMode === "week" && styles.activeTab]}
          onPress={() => {
            setViewMode("week");
            setCurrentDate(new Date());
          }}
        >
          <Text
            style={[
              styles.tabText,
              viewMode === "week" && styles.activeTabText,
            ]}
          >
            Tuần
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, viewMode === "month" && styles.activeTab]}
          onPress={() => {
            setViewMode("month");
            setCurrentDate(new Date());
          }}
        >
          <Text
            style={[
              styles.tabText,
              viewMode === "month" && styles.activeTabText,
            ]}
          >
            Tháng
          </Text>
        </TouchableOpacity>
      </View>

      {/* Date Navigation */}
      <View style={styles.dateNav}>
        <TouchableOpacity onPress={handlePrev} style={styles.navBtn}>
          <Ionicons name="chevron-back" size={24} color="#666" />
        </TouchableOpacity>
        <Text style={styles.dateLabel}>{statsData.dateRangeLabel}</Text>
        <TouchableOpacity onPress={handleNext} style={styles.navBtn}>
          <Ionicons name="chevron-forward" size={24} color="#666" />
        </TouchableOpacity>
      </View>

      {loading ? (
        <ActivityIndicator
          size="large"
          color={APP_COLOR.ORANGE}
          style={{ marginTop: 50 }}
        />
      ) : (
        <ScrollView contentContainerStyle={styles.content}>
          {/* Total Card */}
          <View style={styles.totalCard}>
            <Text style={styles.totalLabel}>Tổng chi tiêu</Text>
            <Text style={styles.totalValue}>
              {statsData.total.toLocaleString("vi-VN")} đ
            </Text>
          </View>

          {/* Chart */}
          <View style={styles.chartContainer}>
            <Text style={styles.sectionTitle}>Biểu đồ</Text>
            <View style={{ flexDirection: "row", height: 200 }}>
              {/* Y-Axis Labels */}
              <View style={styles.yAxis}>
                <Text style={styles.axisLabel}>
                  {formatYLabel(maxChartValue)}
                </Text>
                <Text style={styles.axisLabel}>
                  {formatYLabel(maxChartValue * 0.66)}
                </Text>
                <Text style={styles.axisLabel}>
                  {formatYLabel(maxChartValue * 0.33)}
                </Text>
                <Text style={styles.axisLabel}>0</Text>
              </View>

              {/* Bars */}
              <View style={styles.chart}>
                {statsData.chart.map((item, index) => (
                  <TouchableOpacity
                    key={index}
                    style={styles.barContainer}
                    onPress={() => setSelectedPoint(item)}
                    activeOpacity={0.8}
                  >
                    {selectedPoint?.label === item.label && (
                      <View style={styles.tooltip}>
                        <Text style={styles.tooltipText}>
                          {formatTooltipValue(item.value)}
                        </Text>
                      </View>
                    )}
                    <View style={styles.barWrapper}>
                      <View
                        style={[
                          styles.bar,
                          {
                            height: `${(item.value / maxChartValue) * 100}%`,
                            backgroundColor:
                              selectedPoint?.label === item.label
                                ? APP_COLOR.ORANGE
                                : "#FFCCBC",
                          },
                        ]}
                      />
                    </View>
                    <Text
                      style={[
                        styles.barLabel,
                        selectedPoint?.label === item.label &&
                          styles.selectedLabel,
                      ]}
                    >
                      {item.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          </View>

          {/* Details List */}
          <Text style={styles.sectionTitle}>Chi tiết</Text>
          <View style={styles.list}>
            {statsData.list.length > 0 ? (
              statsData.list.map((item) => (
                <View key={item.id} style={styles.item}>
                  <View style={styles.itemIcon}>
                    <Ionicons
                      name="receipt-outline"
                      size={24}
                      color={APP_COLOR.ORANGE}
                    />
                  </View>
                  <View style={styles.itemInfo}>
                    <Text style={styles.itemTitle}>
                      {item.expense.description}
                    </Text>
                    <Text style={styles.itemDate}>
                      {format(
                        parseISO(item.expense.createdTime),
                        "dd/MM/yyyy HH:mm"
                      )}
                    </Text>
                  </View>
                  <Text style={styles.itemAmount}>
                    -{item.shareAmount.toLocaleString("vi-VN")} đ
                  </Text>
                </View>
              ))
            ) : (
              <Text style={styles.emptyText}>Không có dữ liệu chi tiêu.</Text>
            )}
          </View>
        </ScrollView>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F9F9F9",
  },
  tabContainer: {
    flexDirection: "row",
    padding: 15,
    backgroundColor: "white",
    gap: 10,
    paddingBottom: 5,
  },
  dateNav: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "white",
    paddingHorizontal: 20,
    paddingBottom: 15,
    marginBottom: 10,
  },
  navBtn: {
    padding: 5,
  },
  dateLabel: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#333",
  },
  tab: {
    flex: 1,
    paddingVertical: 10,
    alignItems: "center",
    borderRadius: 8,
    backgroundColor: "#F0F0F0",
  },
  activeTab: {
    backgroundColor: APP_COLOR.ORANGE,
  },
  tabText: {
    color: "#666",
    fontWeight: "600",
  },
  activeTabText: {
    color: "white",
  },
  content: {
    padding: 20,
  },
  totalCard: {
    backgroundColor: "white",
    padding: 20,
    borderRadius: 16,
    alignItems: "center",
    marginBottom: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 5,
    elevation: 2,
  },
  totalLabel: {
    fontSize: 14,
    color: "#888",
    marginBottom: 5,
  },
  totalValue: {
    fontSize: 28,
    fontWeight: "bold",
    color: APP_COLOR.ORANGE,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 15,
  },
  chartContainer: {
    backgroundColor: "white",
    padding: 15,
    borderRadius: 16,
    marginBottom: 20,
  },
  yAxis: {
    justifyContent: "space-between",
    paddingBottom: 25, // Align with bar bottom
    paddingRight: 10,
    alignItems: "flex-end",
    width: 45,
    borderRightWidth: 1,
    borderRightColor: "#F0F0F0",
  },
  axisLabel: {
    fontSize: 10,
    color: "#888",
  },
  chart: {
    flex: 1,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-end",
    paddingLeft: 10,
    paddingBottom: 5,
  },
  barContainer: {
    alignItems: "center",
    flex: 1,
    height: "100%",
    justifyContent: "flex-end",
  },
  barWrapper: {
    height: "85%", // Leave space for label
    width: 12,
    backgroundColor: "#F9F9F9",
    borderRadius: 6,
    justifyContent: "flex-end",
    overflow: "hidden",
  },
  bar: {
    width: "100%",
    borderRadius: 6,
  },
  barLabel: {
    marginTop: 8,
    fontSize: 10,
    color: "#888",
  },
  selectedLabel: {
    fontWeight: "bold",
    color: APP_COLOR.ORANGE,
  },
  tooltip: {
    position: "absolute",
    top: -5,
    backgroundColor: "#333",
    paddingHorizontal: 6,
    paddingVertical: 3,
    borderRadius: 4,
    zIndex: 10,
    marginBottom: 5,
  },
  tooltipText: {
    color: "white",
    fontSize: 10,
    fontWeight: "bold",
  },
  list: {
    gap: 10,
  },
  item: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "white",
    padding: 15,
    borderRadius: 12,
  },
  itemIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#FFF0E0",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  itemInfo: {
    flex: 1,
  },
  itemTitle: {
    fontSize: 15,
    fontWeight: "600",
    color: "#333",
  },
  itemDate: {
    fontSize: 12,
    color: "#888",
  },
  itemAmount: {
    fontSize: 15,
    fontWeight: "bold",
    color: "#E53935",
  },
  emptyText: {
    textAlign: "center",
    color: "#888",
    marginTop: 20,
  },
});

export default StatisticsScreen;

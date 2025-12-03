import React, { useState, useEffect, useMemo } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  ScrollView,
  StatusBar,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router, useLocalSearchParams } from 'expo-router';
import { APP_COLOR } from '@/utils/constant';
import {
  useGetExpenseById,
  useGetGroupMembers,
  useUpdateExpense,
  useGetSharesByExpense,
  useSaveExpenseShares,
} from '@/api/hooks';
import Ionicons from '@expo/vector-icons/Ionicons';
import { ShareInput, ExpenseShareSaveRequest } from '@/types/expense.types';
import { useToast } from '@/context/toast.context';

// Import Components
import { PayerAmountSection } from '@/component/expense/PayerAmountSection';
import { SplitMethodTabs } from '@/component/expense/SplitMethodTabs';
import { SplitList } from '@/component/expense/SplitList';
import { SelectionModal } from '@/component/expense/SelectionModal';

type SplitMethod = 'EQUAL' | 'EXACT' | 'PERCENTAGE' | 'SHARES';

interface SplitInput {
  userId: string;
  name: string;
  value: string;
  isChecked: boolean;
  calculatedAmount?: number;
}

const EditExpenseScreen = () => {
  const { expenseId, groupId } = useLocalSearchParams<{
    expenseId: string;
    groupId: string;
  }>();
  const { showToast } = useToast();

  // 1. Lấy dữ liệu
  const { data: expense, isLoading: isLoadingExpense } = useGetExpenseById(expenseId as string);
  const { data: members, isLoading: isLoadingMembers } = useGetGroupMembers(groupId as string);
  const { data: currentShares, isLoading: isLoadingShares } = useGetSharesByExpense(expenseId as string);

  // 2. Hooks cập nhật
  const { mutate: updateExpense, isPending: isUpdating } = useUpdateExpense(expenseId as string, groupId as string);
  const { mutate: saveShares, isPending: isSavingShares } = useSaveExpenseShares();

  const isPending = isUpdating || isSavingShares;
  const isLoadingData = isLoadingExpense || isLoadingMembers || isLoadingShares;

  // State form
  const [description, setDescription] = useState('');
  const [amount, setAmount] = useState('');
  const [paidBy, setPaidBy] = useState('');
  
  // State chia tiền
  const [splitMethod, setSplitMethod] = useState<SplitMethod>('EXACT');
  const [splitInputs, setSplitInputs] = useState<SplitInput[]>([]);
  const [isInitialized, setIsInitialized] = useState(false);

  // State Modal
  const [showPayerModal, setShowPayerModal] = useState(false);

  // Helpers
  const getMemberId = (m: any) => m.userId || m.user?.id || '';
  const getMemberName = (m: any) => m.userName || m.user?.userName || 'Thành viên';
  const getMemberAvatar = (m: any) => m.user?.avatar || null;

  // 3. Khởi tạo dữ liệu
  useEffect(() => {
    if (expense && members && currentShares && !isInitialized) {
      setDescription(expense.description);
      setAmount(expense.amount.toString());
      setPaidBy(expense.paidBy);

      // Xác định phương thức chia tiền dựa trên shares hiện tại
      setSplitMethod('EXACT');

      const inputs: SplitInput[] = members.map((m) => {
        const userId = getMemberId(m);
        const share = currentShares.find(s => s.userId === userId);
        
        return {
          userId: userId,
          name: getMemberName(m),
          value: share ? share.shareAmount.toString() : '0',
          isChecked: !!share,
        };
      });

      setSplitInputs(inputs);
      setIsInitialized(true);
    }
  }, [expense, members, currentShares, isInitialized]);

  // 4. Logic tính toán (Copy từ useExpenseCreation/Edit logic)
  const { calculatedShares, totalCalculated, isValid } = useMemo(() => {
    const totalAmountNum = parseFloat(amount) || 0;
    const participatingMembers = splitInputs.filter(m => m.isChecked);
    const memberCount = participatingMembers.length || 1;

    let totalCalculated = 0;

    const calculatedShares = splitInputs.map((input) => {
      if (!input.isChecked) {
        return { ...input, calculatedAmount: 0 };
      }

      let calculatedAmount = 0;
      switch (splitMethod) {
        case 'EQUAL':
          const splitAmount = Math.floor((totalAmountNum / memberCount) * 100) / 100;
          const participatingIndex = participatingMembers.findIndex(m => m.userId === input.userId);
          if (participatingIndex === memberCount - 1) {
            calculatedAmount = totalAmountNum - totalCalculated;
          } else {
            calculatedAmount = splitAmount;
          }
          break;

        case 'EXACT':
          calculatedAmount = parseFloat(input.value) || 0;
          break;

        case 'PERCENTAGE':
          const percent = parseFloat(input.value) || 0;
          calculatedAmount = (totalAmountNum * percent) / 100;
          break;

        case 'SHARES':
          const totalShares = participatingMembers.reduce((sum, i) => sum + (parseFloat(i.value) || 0), 0);
          if (totalShares === 0) {
            calculatedAmount = 0;
          } else {
            const portion = parseFloat(input.value) || 0;
            calculatedAmount = (totalAmountNum * portion) / totalShares;
          }
          break;
      }
      totalCalculated += calculatedAmount;
      return { ...input, calculatedAmount };
    });

    totalCalculated = parseFloat(totalCalculated.toFixed(2));
    const isValid = Math.abs(totalCalculated - totalAmountNum) < 1;

    return { calculatedShares, totalCalculated, isValid };
  }, [amount, splitMethod, splitInputs]);

  // 5. Handlers
  const handleToggleCheck = (userId: string) => {
    setSplitInputs((prev) =>
      prev.map((input) =>
        input.userId === userId ? { ...input, isChecked: !input.isChecked } : input
      )
    );
  };

  const handleSplitInputChange = (userId: string, value: string) => {
    setSplitInputs((prev) =>
      prev.map((input) =>
        input.userId === userId ? { ...input, value } : input
      )
    );
  };

  const handleMethodChange = (method: SplitMethod) => {
    setSplitMethod(method);
    setSplitInputs((prev) =>
      prev.map((input) => ({
        ...input,
        value: method === 'SHARES' ? '1' : (method === 'PERCENTAGE' ? '0' : input.value),
      }))
    );
  };

  const handleUpdate = () => {
    if (!description || !amount || !paidBy) {
      showToast('warning', 'Thiếu thông tin', 'Vui lòng điền đầy đủ thông tin');
      return;
    }

    const participatingMembers = splitInputs.filter(m => m.isChecked);
    if (participatingMembers.length === 0) {
      showToast('warning', 'Chưa chọn thành viên', 'Bạn phải chọn ít nhất một người để chia');
      return;
    }
    if (!isValid) {
      showToast(
        'error',
        'Lỗi chia tiền',
        `Tổng đã chia (${totalCalculated.toLocaleString('vi-VN')}đ) không khớp tổng chi tiêu`
      );
      return;
    }

    updateExpense(
      {
        description: description,
        amount: parseFloat(amount),
        paidBy: paidBy,
      },
      {
        onSuccess: () => {
          const sharesForApi: ShareInput[] = calculatedShares
            .filter(share => share.isChecked)
            .map((share) => ({
              userId: share.userId,
              shareAmount: share.calculatedAmount || 0,
              percentage: splitMethod === 'PERCENTAGE' ? (parseFloat(share.value) || 0) : 0,
              portion: splitMethod === 'SHARES' ? (parseInt(share.value) || 1) : undefined,
            }));

          const shareRequest: ExpenseShareSaveRequest = {
            expenseId: expenseId as string,
            totalAmount: parseFloat(amount),
            paidBy: paidBy,
            currency: (expense as any)?.currency || 'VND',
            shares: sharesForApi,
          };

          saveShares(
            shareRequest,
            {
              onSuccess: () => {
                showToast('success', 'Thành công', 'Đã cập nhật chi tiêu');
                router.back();
              },
              onError: (err) => {
                console.log("Error saving shares:", err);
                showToast('error', 'Lỗi', 'Không thể lưu danh sách chia tiền');
              },
            }
          );
        },
        onError: () => {
          showToast('error', 'Lỗi', 'Không thể cập nhật chi tiêu');
        },
      }
    );
  };

  if (isLoadingData) {
    return <ActivityIndicator size="large" color={APP_COLOR.ORANGE} style={styles.center} />;
  }

  const payerMember = members?.find(m => getMemberId(m) === paidBy);

  return (
    <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
      <StatusBar barStyle="dark-content" backgroundColor="#F2F2F7" />
      
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="close" size={28} color="#333" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Sửa chi tiêu</Text>
        <View style={{ width: 28 }} />
      </View>

      <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} style={{ flex: 1 }}>
        <ScrollView style={{ flex: 1 }} contentContainerStyle={styles.scrollContent}>
          
          {/* Description */}
          <View style={styles.descriptionContainer}>
            <Ionicons name="document-text-outline" size={24} color="#666" style={styles.descIcon} />
            <TextInput 
                style={styles.descriptionInput} 
                value={description} 
                onChangeText={setDescription} 
                placeholder="Nhập mô tả (ví dụ: Ăn tối)" 
                placeholderTextColor="#999" 
            />
          </View>

          {/* Payer & Amount */}
          <PayerAmountSection 
             payerName={payerMember ? getMemberName(payerMember) : 'Chọn người'}
             payerAvatar={payerMember ? getMemberAvatar(payerMember) : undefined}
             onPressPayer={() => setShowPayerModal(true)}
             amount={amount}
             setAmount={setAmount}
          />

          {/* Split Method */}
          <SplitMethodTabs current={splitMethod} onChange={handleMethodChange} />

          {/* Split List */}
          <SplitList 
             inputs={calculatedShares} 
             splitMethod={splitMethod}
             onToggle={handleToggleCheck}
             onInput={handleSplitInputChange}
             getAvatar={(id) => {
                const m = members?.find(mem => getMemberId(mem) === id);
                return m ? getMemberAvatar(m) : null;
             }}
          />

        </ScrollView>

        {/* Footer */}
        <View style={styles.fixedFooter}>
           <View style={styles.totalInfoContainer}>
              <Text style={styles.totalLabelFooter}>Tổng đã chia:</Text>
              <Text style={[styles.totalValueFooter, !isValid && styles.totalError]}>
                  {totalCalculated.toLocaleString('vi-VN')}đ
              </Text>
           </View>
           {!isValid && (
                <Text style={styles.errorTextFooter}>
                   Còn thiếu: {(parseFloat(amount || '0') - totalCalculated).toLocaleString('vi-VN')}đ
                </Text>
           )}
           <TouchableOpacity 
              style={[styles.saveButton, (!isValid || isPending) && styles.saveButtonDisabled]}
              onPress={handleUpdate}
              disabled={!isValid || isPending}
           >
              {isPending ? <ActivityIndicator color="#fff" /> : <Text style={styles.saveButtonLabel}>Lưu thay đổi</Text>}
           </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>

      <SelectionModal 
        visible={showPayerModal} onClose={() => setShowPayerModal(false)}
        title="Chọn người trả tiền"
        options={members?.map(m => ({ label: getMemberName(m), value: getMemberId(m) })) || []}
        onSelect={setPaidBy} selectedValue={paidBy}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 15, paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: '#f0f0f0' },
  backButton: { padding: 5 },
  headerTitle: { fontSize: 18, fontWeight: 'bold', color: '#333' },
  scrollContent: { paddingBottom: 40 },
  descriptionContainer: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 20, paddingVertical: 15, borderBottomWidth: 1, borderBottomColor: '#f0f0f0' },
  descIcon: { marginRight: 10 },
  descriptionInput: { flex: 1, fontSize: 18, color: '#333' },
  fixedFooter: { backgroundColor: 'white', borderTopWidth: 1, borderTopColor: '#eee', padding: 20, paddingBottom: Platform.OS === 'ios' ? 30 : 20, shadowColor: '#000', shadowOffset: { width: 0, height: -2 }, shadowOpacity: 0.05, shadowRadius: 4, elevation: 10 },
  totalInfoContainer: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 15 },
  totalLabelFooter: { fontSize: 16, color: '#666' },
  totalValueFooter: { fontSize: 24, fontWeight: 'bold', color: APP_COLOR.ORANGE },
  totalError: { color: 'red' },
  errorTextFooter: { color: 'red', fontSize: 14, textAlign: 'center', marginBottom: 10 },
  saveButton: { backgroundColor: APP_COLOR.ORANGE, paddingVertical: 16, borderRadius: 30, alignItems: 'center' },
  saveButtonDisabled: { backgroundColor: '#ccc' },
  saveButtonLabel: { color: 'white', fontSize: 18, fontWeight: 'bold' },
});

export default EditExpenseScreen;

import { useState, useEffect, useMemo } from "react";
import {
  useGetGroupMembers,
  useCreateExpense,
  useSaveExpenseShares,
} from "@/api/hooks";
import { useCurrentApp } from "@/context/app.context";
import { useToast } from "@/context/toast.context";
import { ShareInput } from "@/types/expense.types";
import { router } from "expo-router";

export type SplitMethod = "EQUAL" | "EXACT" | "PERCENTAGE" | "SHARES";

export interface SplitInput {
  userId: string;
  name: string;
  value: string;
  isChecked: boolean;
  calculatedAmount?: number;
  isManual?: boolean;
  displayAmount?: string;
}

export const useExpenseCreation = (groupId: string, billId: string) => {
  const { appState } = useCurrentApp();
  const { showToast } = useToast();

  const { data: members, isLoading: isLoadingMembers } =
    useGetGroupMembers(groupId);
  const { mutate: createExpense, isPending: isCreating } =
    useCreateExpense(billId);
  const { mutate: saveShares, isPending: isSaving } =
    useSaveExpenseShares(groupId);

  const [description, setDescription] = useState("");
  const [amount, setAmount] = useState("");
  const [paidBy, setPaidBy] = useState("");
  const [splitMethod, setSplitMethod] = useState<SplitMethod>("EQUAL");
  const [splitInputs, setSplitInputs] = useState<SplitInput[]>([]);

  // --- HELPER FUNCTIONS ---
  const unformatNumber = (val: string) => {
    if (!val) return "";
    return val
      .toString()
      .replace(/\./g, "")
      .replace(/[^0-9]/g, "");
  };

  const formatNumber = (val: string | number) => {
    if (val === "" || val === undefined || val === null) return "";
    const cleanStr = unformatNumber(val.toString());
    if (cleanStr === "") return "";
    return new Intl.NumberFormat("vi-VN").format(parseInt(cleanStr));
  };

  // Khởi tạo danh sách thành viên
  useEffect(() => {
    if (members) {
      const currentUserId = appState?.userId ? String(appState.userId) : "";
      if (!paidBy) {
        const isMember = members.some(
          (m) => (m.userId || m.user?.id) === currentUserId
        );
        setPaidBy(
          isMember
            ? currentUserId
            : members[0]?.userId || members[0]?.user?.id || ""
        );
      }

      const totalAmountNum = parseInt(unformatNumber(amount)) || 0;
      const count = members.length || 1;
      const equalShare = Math.round(totalAmountNum / count);

      setSplitInputs(
        members.map((m) => ({
          userId: m.userId || m.user?.id || "",
          name: m.userName || m.user?.userName || "Thành viên",
          // Mặc định chia đều số tiền ban đầu
          value:
            splitMethod === "EXACT"
              ? formatNumber(equalShare)
              : splitMethod === "SHARES"
              ? "1"
              : "0",
          isChecked: true,
          isManual: false, // Ban đầu là Auto để có thể cập nhật theo tổng chi tiêu
        }))
      );
    }
  }, [members, splitMethod]); // Chỉ chạy khi đổi method hoặc load members

  // Cập nhật lại các ô "Auto" khi tổng chi tiêu (amount) thay đổi
  useEffect(() => {
    const totalAmountNum = parseInt(unformatNumber(amount)) || 0;
    if (splitMethod === "EQUAL" || splitMethod === "EXACT") {
      setSplitInputs((prev) => {
        const autoUsers = prev.filter((i) => i.isChecked && !i.isManual);
        const manualTotal = prev
          .filter((i) => i.isChecked && i.isManual)
          .reduce(
            (sum, i) => sum + (parseInt(unformatNumber(i.value)) || 0),
            0
          );
        const remaining = Math.max(0, totalAmountNum - manualTotal);

        if (autoUsers.length === 0) return prev;

        const share = Math.round(remaining / autoUsers.length);
        return prev.map((i) =>
          !i.isManual && i.isChecked ? { ...i, value: formatNumber(share) } : i
        );
      });
    }
  }, [amount]);

  const { calculatedShares, totalCalculated, isValid } = useMemo(() => {
    const totalAmountNum = parseInt(unformatNumber(amount)) || 0;
    const participating = splitInputs.filter((m) => m.isChecked);
    let calcTotal = 0;

    const results = splitInputs.map((input) => {
      if (!input.isChecked)
        return { ...input, calculatedAmount: 0, displayAmount: "0đ" };

      let val = 0;
      const inputVal =
        input.value === "" ? 0 : parseInt(unformatNumber(input.value)) || 0;

      switch (splitMethod) {
        case "EQUAL":
          val = totalAmountNum / (participating.length || 1);
          break;
        case "EXACT":
          val = inputVal;
          break;
        case "PERCENTAGE":
          val = (totalAmountNum * (parseFloat(input.value) || 0)) / 100;
          break;
        case "SHARES":
          const totalShares = participating.reduce(
            (sum, i) => sum + (parseFloat(i.value) || 0),
            0
          );
          val =
            totalShares === 0
              ? 0
              : (totalAmountNum * (parseFloat(input.value) || 0)) / totalShares;
          break;
      }

      const finalVal = Math.round(val);
      calcTotal += finalVal;
      return {
        ...input,
        calculatedAmount: finalVal,
        displayAmount: `${new Intl.NumberFormat("vi-VN").format(finalVal)}đ`,
      };
    });

    return {
      calculatedShares: results,
      totalCalculated: calcTotal,
      isValid: Math.abs(calcTotal - totalAmountNum) < 10,
    };
  }, [amount, splitMethod, splitInputs]);

  const updateInput = (uid: string, val: string) => {
    let cleanVal =
      splitMethod === "PERCENTAGE" || splitMethod === "SHARES"
        ? val.replace(/[^0-9.]/g, "")
        : unformatNumber(val);

    setSplitInputs((prev) => {
      let processedVal =
        splitMethod === "EXACT" ? formatNumber(cleanVal) : cleanVal;

      // Bước 1: Cập nhật giá trị cho người vừa nhập
      const nextState = prev.map((i) =>
        i.userId === uid ? { ...i, value: processedVal, isManual: true } : i
      );

      // Nếu là EQUAL hoặc SHARES thì không cần logic cân đối thủ công
      if (splitMethod === "EQUAL" || splitMethod === "SHARES") return nextState;

      const totalTarget =
        splitMethod === "PERCENTAGE"
          ? 100
          : parseInt(unformatNumber(amount)) || 0;

      // Bước 2: Tính toán phần còn lại cho những người Auto
      const manualTotal = nextState
        .filter((i) => i.isChecked && i.isManual)
        .reduce(
          (sum, i) =>
            sum +
            (splitMethod === "PERCENTAGE"
              ? parseFloat(i.value) || 0
              : parseInt(unformatNumber(i.value)) || 0),
          0
        );

      const autoUsers = nextState.filter((i) => i.isChecked && !i.isManual);
      const remaining = Math.max(0, totalTarget - manualTotal);

      if (autoUsers.length > 0) {
        const rawShare = remaining / autoUsers.length;
        return nextState.map((i) => {
          if (i.isChecked && !i.isManual) {
            return {
              ...i,
              value:
                splitMethod === "PERCENTAGE"
                  ? Number(rawShare.toFixed(2)).toString()
                  : formatNumber(Math.round(rawShare)),
            };
          }
          return i;
        });
      }
      return nextState;
    });
  };

  const toggleCheck = (uid: string) => {
    setSplitInputs((prev) =>
      prev.map((i) =>
        i.userId === uid
          ? { ...i, isChecked: !i.isChecked, isManual: false }
          : i
      )
    );
  };

  const changeMethod = (method: SplitMethod) => {
    setSplitMethod(method);
    const totalAmountNum = parseInt(unformatNumber(amount)) || 0;
    setSplitInputs((prev) =>
      prev.map((i) => ({
        ...i,
        value:
          method === "SHARES"
            ? "1"
            : method === "EXACT"
            ? formatNumber(Math.round(totalAmountNum / prev.length))
            : "0",
        isManual: false,
      }))
    );
  };

  const submit = () => {
    const participating = splitInputs.filter((m) => m.isChecked);
    if (participating.length === 0)
      return showToast("warning", "Thông báo", "Chọn ít nhất 1 người.");
    if (!description || !amount || !paidBy)
      return showToast("warning", "Thiếu thông tin", "Điền đủ thông tin.");
    if (!isValid)
      return showToast(
        "error",
        "Lỗi chia tiền",
        "Tổng chia không khớp hóa đơn."
      );

    createExpense(
      {
        billId,
        groupId,
        description,
        amount: parseInt(unformatNumber(amount)),
        paidBy,
        createdBy: String(appState?.userId),
        userId: paidBy,
        status: "PENDING",
      },
      {
        onSuccess: (newExp) => {
          const sharesApi: ShareInput[] = calculatedShares
            .filter((s) => s.isChecked)
            .map((s) => ({
              userId: s.userId,
              shareAmount: s.calculatedAmount || 0,
              percentage:
                splitMethod === "PERCENTAGE" ? parseFloat(s.value) || 0 : 0,
            }));
          saveShares(
            {
              expenseId: newExp.id,
              totalAmount: newExp.amount,
              paidBy: newExp.paidBy,
              shares: sharesApi,
              currency: "VND",
            },
            {
              onSuccess: () => {
                showToast("success", "Thành công", "Đã tạo chi tiêu.");
                router.replace({
                  pathname: "/(tabs)/groups/expense/[expenseId]",
                  params: { expenseId: newExp.id },
                });
              },
              onError: (e: any) => showToast("error", "Lỗi lưu", e.message),
            }
          );
        },
        onError: (e: any) => showToast("error", "Lỗi tạo", e.message),
      }
    );
  };

  return {
    members,
    isLoadingMembers,
    isPending: isCreating || isSaving,
    form: { description, amount, paidBy, splitMethod, splitInputs },
    setters: { setDescription, setAmount, setPaidBy },
    logic: { toggleCheck, updateInput, changeMethod, submit },
    calc: {
      calculatedShares,
      totalCalculated,
      isValid,
      formatNumber,
      unformatNumber,
    },
    helpers: {
      getMemberName: (m: any) => m.userName || m.user?.userName,
      getMemberId: (m: any) => m.userId || m.user?.id,
    },
  };
};

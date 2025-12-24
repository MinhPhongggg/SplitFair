import { useState, useEffect, useMemo } from "react";
import {
  useGetGroupMembers,
  useCreateExpense,
  useSaveExpenseShares,
} from "@/api/hooks";
import { useCurrentApp } from "@/context/app.context";
import { useToast } from "@/context/toast.context";
import { ExpenseShareSaveRequest, ShareInput } from "@/types/expense.types";
import { router } from "expo-router";

export type SplitMethod = "EQUAL" | "EXACT" | "PERCENTAGE" | "SHARES";

export interface SplitInput {
  userId: string;
  name: string;
  value: string;
  isChecked: boolean;
  calculatedAmount?: number;
}

export const useExpenseCreation = (groupId: string, billId: string) => {
  const { appState } = useCurrentApp();
  const { showToast } = useToast();

  // Data
  const { data: members, isLoading: isLoadingMembers } =
    useGetGroupMembers(groupId);
  const { mutate: createExpense, isPending: isCreating } =
    useCreateExpense(billId);
  const { mutate: saveShares, isPending: isSaving } =
    useSaveExpenseShares(groupId);

  // Form State
  const [description, setDescription] = useState("");
  const [amount, setAmount] = useState("");
  const [paidBy, setPaidBy] = useState("");
  const [splitMethod, setSplitMethod] = useState<SplitMethod>("EQUAL");
  const [splitInputs, setSplitInputs] = useState<SplitInput[]>([]);

  // Init Data
  useEffect(() => {
    if (members) {
      const currentUserId = appState?.userId ? String(appState.userId) : "";
      // Auto select payer
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

      setSplitInputs(
        members.map((m) => ({
          userId: m.userId || m.user?.id || "",
          name: m.userName || m.user?.userName || "Thành viên",
          value: splitMethod === "SHARES" ? "1" : "0",
          isChecked: true,
        }))
      );
    }
  }, [members]);

  // Logic Tính Toán (Giữ nguyên logic cũ của bạn)
  const { calculatedShares, totalCalculated, isValid } = useMemo(() => {
    const totalAmountNum = parseFloat(amount) || 0;
    const participating = splitInputs.filter((m) => m.isChecked);
    const count = participating.length || 1;
    let calcTotal = 0;

    const results = splitInputs.map((input) => {
      if (!input.isChecked) return { ...input, calculatedAmount: 0 };

      let val = 0;
      switch (splitMethod) {
        case "EQUAL":
          const split = Math.floor(totalAmountNum / count);
          const idx = participating.findIndex((m) => m.userId === input.userId);
          val = idx === count - 1 ? totalAmountNum - calcTotal : split;
          break;
        case "EXACT":
          val = parseFloat(input.value) || 0;
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
      calcTotal += val;
      return { ...input, calculatedAmount: val };
    });

    return {
      calculatedShares: results,
      totalCalculated: parseFloat(calcTotal.toFixed(2)),
      isValid: Math.abs(parseFloat(calcTotal.toFixed(2)) - totalAmountNum) < 1,
    };
  }, [amount, splitMethod, splitInputs]);

  // Handlers
  const toggleCheck = (uid: string) => {
    setSplitInputs((prev) =>
      prev.map((i) =>
        i.userId === uid ? { ...i, isChecked: !i.isChecked } : i
      )
    );
  };

  const updateInput = (uid: string, val: string) => {
    if (splitMethod === "PERCENTAGE") {
      // Allow empty string for clearing input
      if (val === "") {
        setSplitInputs((prev) =>
          prev.map((i) => (i.userId === uid ? { ...i, value: "" } : i))
        );
        return;
      }

      const newVal = parseFloat(val);
      if (isNaN(newVal)) return;
      if (newVal > 100) return;

      setSplitInputs((prev) => {
        const otherChecked = prev.filter(
          (i) => i.isChecked && i.userId !== uid
        );
        const remaining = 100 - newVal;

        if (otherChecked.length === 0)
          return prev.map((i) => (i.userId === uid ? { ...i, value: val } : i));

        const share = Math.floor((remaining / otherChecked.length) * 100) / 100;

        const newInputs = prev.map((i) => {
          if (i.userId === uid) return { ...i, value: val };
          if (i.isChecked) {
            return { ...i, value: share.toString() };
          }
          return i;
        });
        return newInputs;
      });
    } else if (splitMethod === "EXACT") {
      // Allow empty string
      if (val === "") {
        setSplitInputs((prev) =>
          prev.map((i) => (i.userId === uid ? { ...i, value: "" } : i))
        );
        return;
      }

      const newVal = parseFloat(val);
      if (isNaN(newVal)) return;

      const totalAmountNum = parseFloat(amount) || 0;
      if (newVal > totalAmountNum) return;

      setSplitInputs((prev) => {
        const otherChecked = prev.filter(
          (i) => i.isChecked && i.userId !== uid
        );
        const remaining = totalAmountNum - newVal;

        if (otherChecked.length === 0)
          return prev.map((i) => (i.userId === uid ? { ...i, value: val } : i));

        const share = Math.floor(remaining / otherChecked.length);

        const newInputs = prev.map((i) => {
          if (i.userId === uid) return { ...i, value: val };
          if (i.isChecked) {
            return { ...i, value: share.toString() };
          }
          return i;
        });
        return newInputs;
      });
    } else {
      setSplitInputs((prev) =>
        prev.map((i) => (i.userId === uid ? { ...i, value: val } : i))
      );
    }
  };

  const changeMethod = (method: SplitMethod) => {
    setSplitMethod(method);
    // Reset values to empty for all manual input methods to avoid '0' or '1' default
    setSplitInputs((prev) => prev.map((i) => ({ ...i, value: "" })));
  };

  const submit = () => {
    const participating = splitInputs.filter((m) => m.isChecked);
    if (participating.length === 0)
      return showToast(
        "warning",
        "Chưa chọn thành viên",
        "Chọn ít nhất 1 người."
      );
    if (!description || !amount || !paidBy)
      return showToast("warning", "Thiếu thông tin", "Điền đủ thông tin.");
    if (!isValid)
      return showToast("error", "Lỗi chia tiền", "Tổng không khớp.");

    createExpense(
      {
        billId,
        groupId,
        description,
        amount: parseFloat(amount),
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
    calc: { calculatedShares, totalCalculated, isValid },
    helpers: {
      getMemberName: (m: any) => m.userName || m.user?.userName,
      getMemberId: (m: any) => m.userId || m.user?.id,
    },
  };
};

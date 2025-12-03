package com.anygroup.splitfair.service.impl;

import com.anygroup.splitfair.dto.ExpenseDTO;
import com.anygroup.splitfair.dto.PaymentStatDTO;
import com.anygroup.splitfair.enums.BillStatus;
import com.anygroup.splitfair.enums.DebtStatus;
import com.anygroup.splitfair.enums.ExpenseStatus;
import com.anygroup.splitfair.enums.ShareStatus;
import com.anygroup.splitfair.model.*;
import com.anygroup.splitfair.repository.*;
import com.anygroup.splitfair.service.ExpenseService;
import com.anygroup.splitfair.enums.NotificationType;
import com.anygroup.splitfair.service.NotificationService;
import com.anygroup.splitfair.mapper.ExpenseMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.List;
import java.util.Optional;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional
public class ExpenseServiceImpl implements ExpenseService {

    private final ExpenseRepository expenseRepository;
    private final BillRepository billRepository;
    private final UserRepository userRepository;
    private final DebtRepository debtRepository;
    private final ExpenseMapper expenseMapper;
    private final ExpenseShareRepository expenseShareRepository;
    private final NotificationService notificationService; // Inject NotificationService

      //Tạo mới Expense (chưa chia shares)
    @Override
    public ExpenseDTO createExpense(ExpenseDTO dto) {
        //  Map DTO → Entity
        Expense expense = expenseMapper.toEntity(dto);

        Bill bill = null;
        // Liên kết Bill
        if (dto.getBillId() != null) {
            bill = billRepository.findById(dto.getBillId())
                    .orElseThrow(() -> new RuntimeException("Bill not found with id: " + dto.getBillId()));
            expense.setBill(bill);
        }

        // Gắn người tạo
        if (dto.getCreatedBy() != null) {
            User creator = userRepository.findById(dto.getCreatedBy())
                    .orElseThrow(() -> new RuntimeException("User not found with id: " + dto.getCreatedBy()));
            expense.setCreatedBy(creator);
        }

        // Gắn người trả tiền
        if (dto.getPaidBy() != null) {
            User payer = userRepository.findById(dto.getPaidBy())
                    .orElseThrow(() -> new RuntimeException("User not found with id: " + dto.getPaidBy()));
            expense.setPaidBy(payer);
        }

        //  Gắn user_id (nếu chưa có thì mặc định bằng createdBy)
        if (dto.getUserId() != null) {
            User user = userRepository.findById(dto.getUserId())
                    .orElseThrow(() -> new RuntimeException("User not found with id: " + dto.getUserId()));
            expense.setUser(user);
        } else if (expense.getCreatedBy() != null) {
            expense.setUser(expense.getCreatedBy());
        }

        //  Gán trạng thái mặc định
        if (expense.getStatus() == null) {
            expense.setStatus(ExpenseStatus.PENDING);
        }

        //  Lưu vào DB
        expense = expenseRepository.save(expense);

        // Gửi thông báo cho người trả tiền (nếu khác người tạo)
        if (expense.getPaidBy() != null && !expense.getPaidBy().getId().equals(expense.getCreatedBy().getId())) {
            notificationService.createNotification(
                    expense.getPaidBy().getId(),
                    "Chi tiêu mới",
                    "Bạn được đánh dấu đã trả " + expense.getAmount() + " cho " + expense.getDescription(),
                    NotificationType.EXPENSE_ADDED,
                    expense.getId().toString()
            );
        }

        //
        if (bill != null) {
            // Cộng dồn số tiền của expense mới vào tổng của Bill
            bill.setTotalAmount(bill.getTotalAmount().add(expense.getAmount()));
            
            // Chuyển trạng thái Bill từ DRAFT sang ACTIVE
            if (bill.getStatus() == BillStatus.DRAFT) {
                bill.setStatus(BillStatus.ACTIVE);
            }
            billRepository.save(bill); // Lưu lại Bill đã cập nhật
        }

        return expenseMapper.toDTO(expense);
    }


     //Lấy tất cả Expense

    @Override
    public List<ExpenseDTO> getAllExpenses() {
        return expenseRepository.findAll()
                .stream()
                .map(expenseMapper::toDTO)
                .collect(Collectors.toList());
    }


     //Lấy 1 Expense theo ID

    @Override
    public ExpenseDTO getExpenseById(UUID id) {
        Expense expense = expenseRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Expense not found with id: " + id));
        return expenseMapper.toDTO(expense);
    }


      //Lấy Expense theo Bill
    @Override
    public List<ExpenseDTO> getExpensesByBill(UUID billId) {
        Bill bill = billRepository.findById(billId)
                .orElseThrow(() -> new RuntimeException("Bill not found with id: " + billId));
        return expenseRepository.findByBill(bill)
                .stream()
                .map(expenseMapper::toDTO)
                .collect(Collectors.toList());
    }


    @Override
    public List<ExpenseDTO> getExpensesCreatedByUser(UUID userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found with id: " + userId));
        return expenseRepository.findByCreatedBy(user)
                .stream()
                .map(expenseMapper::toDTO)
                .collect(Collectors.toList());
    }



    //Lấy Expense theo người thanh toán
    @Override
    public List<ExpenseDTO> getExpensesPaidByUser(UUID userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found with id: " + userId));
        return expenseRepository.findByPaidBy(user)
                .stream()
                .map(expenseMapper::toDTO)
                .collect(Collectors.toList());
    }


    @Override
    @Transactional
    public ExpenseDTO updateExpense(UUID id, ExpenseDTO dto) {
        Expense expense = expenseRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Expense not found with id: " + id));

        // 1. Cập nhật thông tin Expense
        BigDecimal oldAmount = expense.getAmount();
        if (dto.getAmount() != null) expense.setAmount(dto.getAmount());
        if (dto.getDescription() != null) expense.setDescription(dto.getDescription());
        if (dto.getPaidBy() != null) {
            User payer = userRepository.findById(dto.getPaidBy())
                    .orElseThrow(() -> new RuntimeException("User not found with id: " + dto.getPaidBy()));
            expense.setPaidBy(payer);
        }

        // 2. Cập nhật Bill Total
        Bill bill = expense.getBill();
        if (bill != null && dto.getAmount() != null) {
            // Trừ số tiền cũ, cộng số tiền mới
            bill.setTotalAmount(bill.getTotalAmount().subtract(oldAmount).add(dto.getAmount()));
            billRepository.save(bill);
        }

        // 3. TÍNH TOÁN LẠI NỢ
        // Xóa nợ cũ bằng cách clear list (kích hoạt orphanRemoval = true)
        expense.getDebts().clear();
        
        List<ExpenseShare> shares = expenseShareRepository.findByExpense(expense);
        
        for (ExpenseShare share : shares) {
            if (!share.getUser().getId().equals(expense.getPaidBy().getId())) {
                
                BigDecimal shareAmount = share.getShareAmount();
                // Nếu shareAmount là null, tính lại theo % (dùng amount MỚI của expense)
                if (shareAmount == null) {
                    shareAmount = expense.getAmount() 
                        .multiply(share.getPercentage())
                        .divide(BigDecimal.valueOf(100), 2, RoundingMode.HALF_UP);
                }

                Debt debt = new Debt();
                debt.setExpense(expense);
                debt.setAmountFrom(share.getUser());
                debt.setAmountTo(expense.getPaidBy());
                debt.setAmount(shareAmount);
                debt.setStatus(share.getStatus() == ShareStatus.PAID ? DebtStatus.SETTLED : DebtStatus.UNSETTLED);
                
                // Thêm vào list debts của expense
                expense.getDebts().add(debt);
            }
        }
        
        // Lưu expense (sẽ cascade lưu debts mới và xóa debts cũ)
        expenseRepository.save(expense);
        
        return expenseMapper.toDTO(expense);
    }


    @Override
    @Transactional 
    public void deleteExpense(UUID id) {
        // 1. Tìm expense
        Expense expense = expenseRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Expense not found with id: " + id));

        Bill bill = expense.getBill();
        BigDecimal amountToDelete = expense.getAmount();

        // 2. Cập nhật Bill (TRỪ đi số tiền của expense bị xóa)
        if (bill != null) {
            bill.setTotalAmount(bill.getTotalAmount().subtract(amountToDelete));
            billRepository.save(bill);
        }
        
        // 3. Xóa các khoản nợ liên quan
        debtRepository.deleteByExpense_Id(id); // (Bạn cần thêm hàm này vào DebtRepository)

        // 4. Mới xóa expense
        expenseRepository.delete(expense);
    }

    // Thống kê tổng số tiền mỗi user trong một group
    @Override
    public List<PaymentStatDTO> getPaymentStatsByGroup(UUID groupId) {
        return expenseRepository.getPaymentStatsByGroup(groupId);
    }

    @Override
    public List<ExpenseDTO> getExpensesByGroup(UUID groupId) {
        return expenseRepository.findByBill_Group_Id(groupId)
                .stream()
                .map(expenseMapper::toDTO)
                .collect(Collectors.toList());
    }
}

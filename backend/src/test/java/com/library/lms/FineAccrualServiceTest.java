package com.library.lms;

import com.library.lms.entity.Book;
import com.library.lms.entity.BookCopy;
import com.library.lms.entity.Category;
import com.library.lms.entity.Fine;
import com.library.lms.entity.LibrarySettings;
import com.library.lms.entity.Loan;
import com.library.lms.entity.Member;
import com.library.lms.entity.User;
import com.library.lms.repository.FineRepository;
import com.library.lms.repository.LibrarySettingsRepository;
import com.library.lms.repository.LoanRepository;
import com.library.lms.service.FineAccrualService;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.bean.override.mockito.MockitoBean;

import java.math.BigDecimal;
import java.time.Clock;
import java.time.Instant;
import java.time.LocalDate;
import java.time.ZoneOffset;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertNull;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@SpringBootTest
class FineAccrualServiceTest {

    @Autowired
    private FineAccrualService fineAccrualService;

    @MockitoBean
    private LoanRepository loanRepository;
    @MockitoBean
    private FineRepository fineRepository;
    @MockitoBean
    private LibrarySettingsRepository settingsRepository;
    @MockitoBean
    private Clock clock;

    @Test
    void accruesFineForOverdueBorrowedLoan() {
        Loan loan = loan(50L, LocalDate.of(2026, 11, 10));
        when(settingsRepository.findFirstByOrderBySettingIdAsc()).thenReturn(Optional.of(settings()));
        when(loanRepository.findByStatusAndDueDateBefore(eq(Loan.Status.BORROWED), any(LocalDate.class)))
                .thenReturn(List.of(loan));
        when(fineRepository.findByLoanLoanIdForUpdate(50L)).thenReturn(Optional.empty());
        when(fineRepository.save(any(Fine.class))).thenAnswer(inv -> {
            Fine fine = inv.getArgument(0);
            fine.setFineId(9L);
            return fine;
        });

        int changed = fineAccrualService.accrueOverdueFines(LocalDate.of(2026, 11, 13));

        assertEquals(1, changed);
        Fine saved = captureSavedFine();
        assertNotNull(saved);
        assertEquals(0, new BigDecimal("30.00").compareTo(saved.getFineAmount()));
        assertEquals(Fine.Status.UNPAID, saved.getStatus());
    }

    @Test
    void increasesAccruedAmountAsOverdueDaysGrow() {
        Loan loan = loan(50L, LocalDate.of(2026, 11, 10));
        Fine existing = fine(9L, loan, new BigDecimal("20.00"), BigDecimal.ZERO, Fine.Status.UNPAID);
        when(fineRepository.findByLoanLoanIdForUpdate(50L)).thenReturn(Optional.of(existing));
        when(fineRepository.save(any(Fine.class))).thenAnswer(inv -> inv.getArgument(0));

        Fine result = fineAccrualService.accrueForLoan(loan, settings(), LocalDate.of(2026, 11, 13));

        assertNotNull(result);
        assertEquals(0, new BigDecimal("30.00").compareTo(result.getFineAmount()));
        assertEquals(Fine.Status.UNPAID, result.getStatus());
    }

    @Test
    void waivedFineIsNotReaccrued() {
        Loan loan = loan(50L, LocalDate.of(2026, 11, 10));
        Fine waived = fine(9L, loan, new BigDecimal("10.00"), BigDecimal.ZERO, Fine.Status.WAIVED);
        when(fineRepository.findByLoanLoanIdForUpdate(50L)).thenReturn(Optional.of(waived));

        Fine result = fineAccrualService.accrueForLoan(loan, settings(), LocalDate.of(2026, 11, 20));

        assertEquals(Fine.Status.WAIVED, result.getStatus());
        assertEquals(0, new BigDecimal("10.00").compareTo(result.getFineAmount()));
        verify(fineRepository, never()).save(any(Fine.class));
    }

    @Test
    void noFineWhenNotYetOverdue() {
        Loan loan = loan(50L, LocalDate.of(2026, 11, 10));
        when(fineRepository.findByLoanLoanIdForUpdate(50L)).thenReturn(Optional.empty());

        Fine result = fineAccrualService.accrueForLoan(loan, settings(), LocalDate.of(2026, 11, 10));

        assertNull(result);
        verify(fineRepository, never()).save(any(Fine.class));
    }

    @Test
    void dailyJobUsesClockDate() {
        fixedClock(LocalDate.of(2026, 11, 13));
        when(settingsRepository.findFirstByOrderBySettingIdAsc()).thenReturn(Optional.of(settings()));
        when(loanRepository.findByStatusAndDueDateBefore(eq(Loan.Status.BORROWED), any(LocalDate.class)))
                .thenReturn(List.of());

        fineAccrualService.accrueOverdueFinesDaily();

        verify(loanRepository).findByStatusAndDueDateBefore(eq(Loan.Status.BORROWED), any(LocalDate.class));
    }

    private Fine captureSavedFine() {
        var captor = org.mockito.ArgumentCaptor.forClass(Fine.class);
        verify(fineRepository).save(captor.capture());
        return captor.getValue();
    }

    private void fixedClock(LocalDate date) {
        Clock fixed = Clock.fixed(date.atStartOfDay().toInstant(ZoneOffset.UTC), ZoneOffset.UTC);
        when(clock.instant()).thenReturn(fixed.instant());
        when(clock.getZone()).thenReturn(fixed.getZone());
    }

    private Loan loan(Long loanId, LocalDate dueDate) {
        Category category = new Category();
        category.setCategoryId(1L);
        Book book = new Book();
        book.setBookId(20L);
        book.setCategory(category);
        book.setTitle("Clean Code");
        BookCopy copy = new BookCopy();
        copy.setCopyId(30L);
        copy.setBook(book);
        copy.setAccessionNumber("ACC030");
        copy.setStatus(BookCopy.Status.BORROWED);
        Member member = new Member();
        member.setMemberId(1L);
        member.setFirstName("Test");
        member.setLastName("Member");
        User staff = new User();
        staff.setUserId(2L);
        Loan loan = new Loan();
        loan.setLoanId(loanId);
        loan.setMember(member);
        loan.setCopy(copy);
        loan.setIssuedBy(staff);
        loan.setIssueDate(dueDate.minusDays(14));
        loan.setDueDate(dueDate);
        loan.setStatus(Loan.Status.BORROWED);
        return loan;
    }

    private Fine fine(Long id, Loan loan, BigDecimal amount, BigDecimal paid, Fine.Status status) {
        Fine fine = new Fine();
        fine.setFineId(id);
        fine.setLoan(loan);
        fine.setFineAmount(amount);
        fine.setAmountPaid(paid);
        fine.setStatus(status);
        return fine;
    }

    private LibrarySettings settings() {
        LibrarySettings settings = new LibrarySettings();
        settings.setSettingId(1L);
        settings.setBorrowingLimit(3);
        settings.setBorrowingPeriodDays(14);
        settings.setFinePerDay(new BigDecimal("10.00"));
        settings.setFineGracePeriodDays(0);
        settings.setMaxOutstandingFine(new BigDecimal("500.00"));
        return settings;
    }
}

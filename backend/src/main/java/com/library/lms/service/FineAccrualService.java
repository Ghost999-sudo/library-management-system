package com.library.lms.service;

import com.library.lms.entity.Fine;
import com.library.lms.entity.LibrarySettings;
import com.library.lms.entity.Loan;
import com.library.lms.repository.FineRepository;
import com.library.lms.repository.LibrarySettingsRepository;
import com.library.lms.repository.LoanRepository;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.Clock;
import java.time.LocalDate;
import java.time.temporal.ChronoUnit;
import java.util.List;

/**
 * Accrues overdue fines automatically, once per day, as total-to-date amounts.
 * Waived fines are left unchanged. Amounts are stored so dashboard/reports/fine
 * views reflect overdue balances before a book is returned.
 */
@Service
public class FineAccrualService {

    private final LoanRepository loanRepository;
    private final FineRepository fineRepository;
    private final LibrarySettingsRepository settingsRepository;
    private final Clock clock;

    public FineAccrualService(LoanRepository loanRepository,
                              FineRepository fineRepository,
                              LibrarySettingsRepository settingsRepository,
                              Clock clock) {
        this.loanRepository = loanRepository;
        this.fineRepository = fineRepository;
        this.settingsRepository = settingsRepository;
        this.clock = clock;
    }

    /** Daily job (system timezone); total-to-date calculation catches up after downtime. */
    @Scheduled(cron = "0 5 0 * * *")
    @Transactional
    public void accrueOverdueFinesDaily() {
        accrueOverdueFines(LocalDate.now(clock));
    }

    /** Accrues fines for all borrowed loans overdue as of {@code asOfDate}. */
    @Transactional
    public int accrueOverdueFines(LocalDate asOfDate) {
        LibrarySettings settings = settingsRepository.findFirstByOrderBySettingIdAsc().orElse(null);
        if (settings == null) {
            return 0;
        }

        // A loan can owe only after grace days have elapsed (charge starts the next day).
        LocalDate latestDueDate = asOfDate.minusDays(settings.getFineGracePeriodDays() + 1L);
        List<Loan> overdueLoans = loanRepository.findByStatusAndDueDateBefore(
                Loan.Status.BORROWED, latestDueDate.plusDays(1));

        int changed = 0;
        for (Loan loan : overdueLoans) {
            if (accrueForLoan(loan, settings, asOfDate) != null) {
                changed++;
            }
        }
        return changed;
    }

    /** Finalizes (or creates) the fine for a loan being returned on {@code returnDate}. */
    @Transactional
    public Fine finalizeForReturn(Loan loan, LibrarySettings settings, LocalDate returnDate) {
        return accrueForLoan(loan, settings, returnDate);
    }

    /**
     * Creates or updates the fine for a single loan to the amount owed as of
     * {@code asOfDate}. Returns the fine when one exists/is created, or {@code null}
     * when nothing is owed yet. Waived fines are never modified.
     */
    @Transactional
    public Fine accrueForLoan(Loan loan, LibrarySettings settings, LocalDate asOfDate) {
        LocalDate chargeFrom = loan.getDueDate().plusDays(settings.getFineGracePeriodDays());
        long overdueDays = ChronoUnit.DAYS.between(chargeFrom, asOfDate);

        Fine fine = fineRepository.findByLoanLoanIdForUpdate(loan.getLoanId()).orElse(null);

        if (overdueDays <= 0) {
            return fine; // not chargeable yet; leave any pre-existing fine untouched
        }

        if (fine != null && fine.getStatus() == Fine.Status.WAIVED) {
            return fine;
        }

        BigDecimal accruedAmount = settings.getFinePerDay().multiply(BigDecimal.valueOf(overdueDays));

        if (fine == null) {
            Fine assessed = new Fine();
            assessed.setLoan(loan);
            assessed.setFineAmount(accruedAmount);
            assessed.setAmountPaid(BigDecimal.ZERO);
            assessed.setStatus(Fine.Status.UNPAID);
            return fineRepository.save(assessed);
        }

        if (fine.getFineAmount().compareTo(accruedAmount) == 0) {
            return fine; // already accrued to date
        }

        fine.setFineAmount(accruedAmount);
        BigDecimal paid = fine.getAmountPaid() == null ? BigDecimal.ZERO : fine.getAmountPaid();
        fine.setAmountPaid(paid);
        fine.setStatus(resolveStatus(accruedAmount, paid));
        return fineRepository.save(fine);
    }

    private Fine.Status resolveStatus(BigDecimal amount, BigDecimal paid) {
        if (paid.compareTo(amount) >= 0) {
            return Fine.Status.PAID;
        }
        if (paid.compareTo(BigDecimal.ZERO) > 0) {
            return Fine.Status.PARTIALLY_PAID;
        }
        return Fine.Status.UNPAID;
    }
}

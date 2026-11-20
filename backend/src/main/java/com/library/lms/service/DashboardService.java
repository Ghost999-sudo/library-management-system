package com.library.lms.service;

import com.library.lms.dto.response.DashboardSummaryResponse;
import com.library.lms.entity.BookCopy;
import com.library.lms.entity.Fine;
import com.library.lms.entity.Loan;
import com.library.lms.repository.BookCopyRepository;
import com.library.lms.repository.BookRepository;
import com.library.lms.repository.FineRepository;
import com.library.lms.repository.LoanRepository;
import com.library.lms.repository.MemberRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.Clock;
import java.time.LocalDate;
import java.util.List;

/** Dashboard figures (section 15.1), all calculated from live database counts. */
@Service
@Transactional(readOnly = true)
public class DashboardService {

    private final BookRepository bookRepository;
    private final BookCopyRepository bookCopyRepository;
    private final MemberRepository memberRepository;
    private final LoanRepository loanRepository;
    private final FineRepository fineRepository;
    private final Clock clock;

    public DashboardService(BookRepository bookRepository,
                            BookCopyRepository bookCopyRepository,
                            MemberRepository memberRepository,
                            LoanRepository loanRepository,
                            FineRepository fineRepository,
                            Clock clock) {
        this.bookRepository = bookRepository;
        this.bookCopyRepository = bookCopyRepository;
        this.memberRepository = memberRepository;
        this.loanRepository = loanRepository;
        this.fineRepository = fineRepository;
        this.clock = clock;
    }

    public DashboardSummaryResponse getSummary() {
        BigDecimal outstanding = fineRepository.sumOutstandingByStatuses(
                List.of(Fine.Status.UNPAID, Fine.Status.PARTIALLY_PAID));
        if (outstanding == null) {
            outstanding = BigDecimal.ZERO;
        }

        return new DashboardSummaryResponse(
                bookRepository.count(),
                bookCopyRepository.count(),
                bookCopyRepository.countByStatus(BookCopy.Status.AVAILABLE),
                bookCopyRepository.countByStatus(BookCopy.Status.BORROWED),
                memberRepository.count(),
                loanRepository.countByStatus(Loan.Status.BORROWED),
                loanRepository.countByStatusAndDueDateBefore(
                        Loan.Status.BORROWED, LocalDate.now(clock)),
                outstanding);
    }
}

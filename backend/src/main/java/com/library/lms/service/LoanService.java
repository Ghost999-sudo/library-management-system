package com.library.lms.service;

import com.library.lms.dto.request.IssueBookRequest;
import com.library.lms.dto.response.LoanResponse;
import com.library.lms.dto.response.PagedResponse;
import com.library.lms.dto.response.ReturnResponse;
import com.library.lms.entity.BookCopy;
import com.library.lms.entity.Fine;
import com.library.lms.entity.LibrarySettings;
import com.library.lms.entity.Loan;
import com.library.lms.entity.Member;
import com.library.lms.exception.BusinessRuleException;
import com.library.lms.exception.ResourceNotFoundException;
import com.library.lms.repository.BookCopyRepository;
import com.library.lms.repository.FineRepository;
import com.library.lms.repository.LibrarySettingsRepository;
import com.library.lms.repository.LoanRepository;
import com.library.lms.repository.MemberRepository;
import com.library.lms.repository.UserRepository;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.Clock;
import java.time.LocalDate;
import java.time.temporal.ChronoUnit;
import java.util.List;

/**
 * Issuing and returning books (sections 12 and 18 of the REST API documentation).
 *
 * <p>All dates and the issuing staff member come from the server. The physical copy,
 * loan and fine rows are locked where necessary so concurrent requests cannot issue
 * the same copy twice or return the same loan twice.</p>
 */
@Service
@Transactional(readOnly = true)
public class LoanService {

    private static final List<Fine.Status> OPEN_STATUSES =
            List.of(Fine.Status.UNPAID, Fine.Status.PARTIALLY_PAID);

    private final LoanRepository loanRepository;
    private final BookCopyRepository bookCopyRepository;
    private final MemberRepository memberRepository;
    private final UserRepository userRepository;
    private final FineRepository fineRepository;
    private final LibrarySettingsRepository settingsRepository;
    private final Clock clock;

    public LoanService(LoanRepository loanRepository,
                       BookCopyRepository bookCopyRepository,
                       MemberRepository memberRepository,
                       UserRepository userRepository,
                       FineRepository fineRepository,
                       LibrarySettingsRepository settingsRepository,
                       Clock clock) {
        this.loanRepository = loanRepository;
        this.bookCopyRepository = bookCopyRepository;
        this.memberRepository = memberRepository;
        this.userRepository = userRepository;
        this.fineRepository = fineRepository;
        this.settingsRepository = settingsRepository;
        this.clock = clock;
    }

    /**
     * Issues a copy to a member. Every rule here is enforced server-side, including
     * the ones the frontend might try to skip (dates, limits and outstanding fines).
     */
    @Transactional
    public LoanResponse issue(IssueBookRequest request, Long staffUserId) {
        LibrarySettings settings = findSettings();

        Member member = memberRepository.findById(request.getMemberId())
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Member not found: " + request.getMemberId()));
        if (member.getStatus() != Member.Status.ACTIVE) {
            throw new BusinessRuleException("Cannot issue books to an inactive member");
        }

        BigDecimal outstanding = fineRepository.sumOutstandingByMemberAndStatuses(
                member.getMemberId(), OPEN_STATUSES);
        if (outstanding.compareTo(settings.getMaxOutstandingFine()) >= 0) {
            throw new BusinessRuleException(
                    "Member has reached the maximum outstanding fine limit");
        }

        long currentLoans = loanRepository.countByMemberMemberIdAndStatus(
                member.getMemberId(), Loan.Status.BORROWED);
        if (currentLoans >= settings.getBorrowingLimit()) {
            throw new BusinessRuleException("Member has reached the borrowing limit");
        }

        // PESSIMISTIC_WRITE makes the availability check and the status update atomic.
        BookCopy copy = bookCopyRepository.findByIdForUpdate(request.getCopyId())
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Book copy not found: " + request.getCopyId()));
        if (copy.getStatus() != BookCopy.Status.AVAILABLE) {
            throw new BusinessRuleException(
                    "Book copy is not available: " + request.getCopyId());
        }

        LocalDate today = LocalDate.now(clock);
        Loan loan = new Loan();
        loan.setMember(member);
        loan.setCopy(copy);
        loan.setIssuedBy(userRepository.getReferenceById(staffUserId));
        loan.setIssueDate(today);
        loan.setDueDate(today.plusDays(settings.getBorrowingPeriodDays()));
        loan.setReturnDate(null);
        loan.setStatus(Loan.Status.BORROWED);
        Loan saved = loanRepository.save(loan);

        copy.setStatus(BookCopy.Status.BORROWED);
        bookCopyRepository.save(copy);

        return new LoanResponse(saved);
    }

    public PagedResponse<LoanResponse> getAll(Pageable pageable) {
        return PagedResponse.from(loanRepository.findAll(pageable), LoanResponse::new);
    }

    public LoanResponse getById(Long loanId) {
        return new LoanResponse(findLoan(loanId));
    }

    /** Members only ever receive their own loans; the member id comes from the token. */
    public PagedResponse<LoanResponse> getMyLoans(Long userId, Pageable pageable) {
        Long memberId = findMemberByUserId(userId).getMemberId();
        return PagedResponse.from(
                loanRepository.findByMemberMemberId(memberId, pageable), LoanResponse::new);
    }

    public PagedResponse<LoanResponse> getOverdue(Pageable pageable) {
        return PagedResponse.from(
                loanRepository.findByStatusAndDueDateBefore(
                        Loan.Status.BORROWED, LocalDate.now(clock), pageable),
                LoanResponse::new);
    }

    /**
     * Records the return, frees the copy and assesses an overdue fine when applicable.
     * A loan can only be returned once; the locked row prevents double processing.
     */
    @Transactional
    public ReturnResponse returnBook(Long loanId) {
        Loan loan = loanRepository.findByIdForUpdate(loanId)
                .orElseThrow(() -> new ResourceNotFoundException("Loan not found: " + loanId));
        if (loan.getStatus() == Loan.Status.RETURNED) {
            throw new BusinessRuleException("Loan has already been returned");
        }

        LibrarySettings settings = findSettings();
        LocalDate today = LocalDate.now(clock);

        loan.setReturnDate(today);
        loan.setStatus(Loan.Status.RETURNED);
        loanRepository.save(loan);

        BookCopy copy = loan.getCopy();
        copy.setStatus(BookCopy.Status.AVAILABLE);
        bookCopyRepository.save(copy);

        // Grace days are free; only whole overdue days are charged.
        LocalDate chargeFrom = loan.getDueDate().plusDays(settings.getFineGracePeriodDays());
        long overdueDays = ChronoUnit.DAYS.between(chargeFrom, today);
        Fine fine = fineRepository.findByLoanLoanId(loanId).orElse(null);

        if (fine == null && overdueDays > 0) {
            Fine assessed = new Fine();
            assessed.setLoan(loan);
            assessed.setFineAmount(
                    settings.getFinePerDay().multiply(BigDecimal.valueOf(overdueDays)));
            assessed.setAmountPaid(BigDecimal.ZERO);
            assessed.setStatus(Fine.Status.UNPAID);
            fine = fineRepository.save(assessed);
        }
        // If a fine already exists we reuse it; a second fine per loan is never created.

        return new ReturnResponse(loan, fine);
    }

    // ---------- internal helpers ----------

    private LibrarySettings findSettings() {
        return settingsRepository.findFirstByOrderBySettingIdAsc()
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Library settings are not configured"));
    }

    private Member findMemberByUserId(Long userId) {
        return memberRepository.findByUserUserId(userId)
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Member profile not found for the current user"));
    }

    private Loan findLoan(Long loanId) {
        return loanRepository.findById(loanId)
                .orElseThrow(() -> new ResourceNotFoundException("Loan not found: " + loanId));
    }
}

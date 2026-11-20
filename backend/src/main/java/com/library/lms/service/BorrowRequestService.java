package com.library.lms.service;

import com.library.lms.dto.request.ApproveBorrowRequestRequest;
import com.library.lms.dto.request.CreateBorrowRequestRequest;
import com.library.lms.dto.request.IssueBookRequest;
import com.library.lms.dto.request.RejectBorrowRequestRequest;
import com.library.lms.dto.response.BorrowRequestResponse;
import com.library.lms.dto.response.LoanResponse;
import com.library.lms.dto.response.PagedResponse;
import com.library.lms.entity.Book;
import com.library.lms.entity.BookCopy;
import com.library.lms.entity.BorrowRequest;
import com.library.lms.entity.Member;
import com.library.lms.entity.User;
import com.library.lms.exception.BusinessRuleException;
import com.library.lms.exception.ResourceNotFoundException;
import com.library.lms.repository.BookCopyRepository;
import com.library.lms.repository.BookRepository;
import com.library.lms.repository.BorrowRequestRepository;
import com.library.lms.repository.MemberRepository;
import com.library.lms.repository.UserRepository;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Clock;
import java.time.LocalDate;

/**
 * Borrow requests (member asks for a title, librarian decides).
 *
 * <p>Approval delegates to LoanService.issue, so dates, borrowing limits, outstanding
 * fines and copy availability are still decided by the existing authoritative rules.
 * No loan row or copy status is changed while a request is merely pending.</p>
 */
@Service
@Transactional(readOnly = true)
public class BorrowRequestService {

    private final BorrowRequestRepository requestRepository;
    private final BookRepository bookRepository;
    private final BookCopyRepository bookCopyRepository;
    private final MemberRepository memberRepository;
    private final UserRepository userRepository;
    private final LoanService loanService;
    private final Clock clock;

    public BorrowRequestService(BorrowRequestRepository requestRepository,
                                BookRepository bookRepository,
                                BookCopyRepository bookCopyRepository,
                                MemberRepository memberRepository,
                                UserRepository userRepository,
                                LoanService loanService,
                                Clock clock) {
        this.requestRepository = requestRepository;
        this.bookRepository = bookRepository;
        this.bookCopyRepository = bookCopyRepository;
        this.memberRepository = memberRepository;
        this.userRepository = userRepository;
        this.loanService = loanService;
        this.clock = clock;
    }

    /** The member is derived from the token; the payload only carries the title. */
    @Transactional
    public BorrowRequestResponse request(Long userId, CreateBorrowRequestRequest payload) {
        Member member = findMemberByUserId(userId);
        if (member.getStatus() != Member.Status.ACTIVE) {
            throw new BusinessRuleException("Only active members can request books");
        }

        Book book = bookRepository.findById(payload.getBookId())
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Book not found: " + payload.getBookId()));

        if (requestRepository.existsByMemberMemberIdAndBookBookIdAndStatus(
                member.getMemberId(), book.getBookId(), BorrowRequest.Status.PENDING)) {
            throw new BusinessRuleException("You already have a pending request for this book");
        }

        BorrowRequest request = new BorrowRequest();
        request.setMember(member);
        request.setBook(book);
        request.setStatus(BorrowRequest.Status.PENDING);
        request.setRequestDate(LocalDate.now(clock));
        return new BorrowRequestResponse(requestRepository.save(request));
    }

    public PagedResponse<BorrowRequestResponse> getMyRequests(Long userId, Pageable pageable) {
        Long memberId = findMemberByUserId(userId).getMemberId();
        return PagedResponse.from(
                requestRepository.findByMemberMemberId(memberId, pageable),
                BorrowRequestResponse::new);
    }

    /** Staff queue; a null status means all decisions. */
    public PagedResponse<BorrowRequestResponse> getAll(BorrowRequest.Status status, Pageable pageable) {
        return PagedResponse.from(
                status == null
                        ? requestRepository.findAll(pageable)
                        : requestRepository.findByStatus(status, pageable),
                BorrowRequestResponse::new);
    }

    /**
     * Approves a pending request. The chosen copy must belong to the requested title;
     * LoanService then performs the real issue and fails if any rule is violated.
     */
    @Transactional
    public LoanResponse approve(Long requestId, ApproveBorrowRequestRequest payload, Long staffUserId) {
        BorrowRequest request = findRequestForDecision(requestId);
        BookCopy copy = bookCopyRepository.findById(payload.getCopyId())
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Book copy not found: " + payload.getCopyId()));
        if (!copy.getBook().getBookId().equals(request.getBook().getBookId())) {
            throw new BusinessRuleException("The selected copy is not a copy of the requested book");
        }

        IssueBookRequest issue = new IssueBookRequest();
        issue.setMemberId(request.getMember().getMemberId());
        issue.setCopyId(copy.getCopyId());
        LoanResponse loan = loanService.issue(issue, staffUserId);

        request.setStatus(BorrowRequest.Status.APPROVED);
        request.setDecidedBy(userRepository.getReferenceById(staffUserId));
        request.setDecidedDate(LocalDate.now(clock));
        request.setNote(null);
        requestRepository.save(request);
        return loan;
    }

    @Transactional
    public BorrowRequestResponse reject(Long requestId, RejectBorrowRequestRequest payload, Long staffUserId) {
        BorrowRequest request = findRequestForDecision(requestId);
        request.setStatus(BorrowRequest.Status.REJECTED);
        request.setDecidedBy(userRepository.getReferenceById(staffUserId));
        request.setDecidedDate(LocalDate.now(clock));
        request.setNote(payload.getNote() == null || payload.getNote().isBlank()
                ? null
                : payload.getNote().trim());
        return new BorrowRequestResponse(requestRepository.save(request));
    }

    // ---------- internal helpers ----------

    private BorrowRequest findRequestForDecision(Long requestId) {
        BorrowRequest request = requestRepository.findByIdForUpdate(requestId)
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Borrow request not found: " + requestId));
        if (request.getStatus() != BorrowRequest.Status.PENDING) {
            throw new BusinessRuleException("Only pending requests can be decided");
        }
        return request;
    }

    private Member findMemberByUserId(Long userId) {
        return memberRepository.findByUserUserId(userId)
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Member profile not found for the current user"));
    }
}

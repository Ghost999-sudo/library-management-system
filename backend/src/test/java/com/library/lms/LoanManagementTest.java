package com.library.lms;

import com.library.lms.entity.Book;
import com.library.lms.entity.BookCopy;
import com.library.lms.entity.Category;
import com.library.lms.entity.Fine;
import com.library.lms.entity.LibrarySettings;
import com.library.lms.entity.Loan;
import com.library.lms.entity.Member;
import com.library.lms.entity.User;
import com.library.lms.repository.BookCopyRepository;
import com.library.lms.repository.FineRepository;
import com.library.lms.repository.LibrarySettingsRepository;
import com.library.lms.repository.LoanRepository;
import com.library.lms.repository.MemberRepository;
import com.library.lms.repository.UserRepository;
import com.library.lms.security.JwtTokenService;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;

import java.math.BigDecimal;
import java.time.Clock;
import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

/**
 * HTTP-level checks for Phase 7 loans. Repositories are mocked, so no database rows
 * are written; security, services, transactional logic and DTO mapping are real.
 */
@SpringBootTest
@AutoConfigureMockMvc
class LoanManagementTest {

    @Autowired
    private MockMvc mockMvc;
    @Autowired
    private JwtTokenService tokenService;
    @Autowired
    private PasswordEncoder passwordEncoder;
    @Autowired
    private Clock clock;

    @MockitoBean
    private UserRepository userRepository;
    @MockitoBean
    private MemberRepository memberRepository;
    @MockitoBean
    private LoanRepository loanRepository;
    @MockitoBean
    private BookCopyRepository bookCopyRepository;
    @MockitoBean
    private FineRepository fineRepository;
    @MockitoBean
    private LibrarySettingsRepository settingsRepository;

    // ---------- Access control and history ----------

    @Test
    void memberCanReadOwnLoansButCannotIssue() throws Exception {
        Member member = member(1L, Member.Status.ACTIVE);
        when(memberRepository.findByUserUserId(1L)).thenReturn(Optional.of(member));
        when(loanRepository.findByMemberMemberId(eq(1L), any(Pageable.class)))
                .thenReturn(new PageImpl<>(List.of(
                        loan(50L, member, copy(30L, BookCopy.Status.BORROWED),
                                user(2L, User.Role.LIBRARIAN),
                                Loan.Status.BORROWED, LocalDate.now(clock).plusDays(5))),
                        PageRequest.of(0, 20), 1));

        mockMvc.perform(get("/api/v1/loans/me")
                        .header("Authorization", bearer(1L, User.Role.MEMBER)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.content[0].loanId").value(50))
                .andExpect(jsonPath("$.content[0].memberId").value(1));

        // The member id must come from the token, never from a query parameter.
        verify(memberRepository).findByUserUserId(1L);

        mockMvc.perform(post("/api/v1/loans")
                        .header("Authorization", bearer(1L, User.Role.MEMBER))
                        .contentType("application/json")
                        .content("{\"memberId\":1,\"copyId\":30}"))
                .andExpect(status().isForbidden());
    }

    // ---------- Issuing ----------

    @Test
    void librarianIssuesBookWithServerCalculatedDates() throws Exception {
        stubIssuePreconditions(BigDecimal.ZERO, 0L, BookCopy.Status.AVAILABLE);
        when(userRepository.getReferenceById(2L)).thenReturn(user(2L, User.Role.LIBRARIAN));
        when(loanRepository.save(any(Loan.class))).thenAnswer(inv -> {
            Loan loan = inv.getArgument(0);
            loan.setLoanId(100L);
            return loan;
        });

        LocalDate today = LocalDate.now(clock);
        // Client tries to override server-controlled fields; all must be ignored.
        String body = """
                {"memberId":1,"copyId":30,"issuedBy":999,
                 "issueDate":"2000-01-01","dueDate":"2000-01-02","status":"RETURNED"}
                """;

        mockMvc.perform(post("/api/v1/loans")
                        .header("Authorization", bearer(2L, User.Role.LIBRARIAN))
                        .contentType("application/json")
                        .content(body))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.loanId").value(100))
                .andExpect(jsonPath("$.memberId").value(1))
                .andExpect(jsonPath("$.copyId").value(30))
                .andExpect(jsonPath("$.issuedBy").value(2))
                .andExpect(jsonPath("$.issueDate").value(today.toString()))
                .andExpect(jsonPath("$.dueDate").value(today.plusDays(14).toString()))
                .andExpect(jsonPath("$.status").value("BORROWED"));

        verify(bookCopyRepository).save(any(BookCopy.class));
    }

    @Test
    void issueRejectedWhenCopyIsNotAvailable() throws Exception {
        stubIssuePreconditions(BigDecimal.ZERO, 0L, BookCopy.Status.BORROWED);

        mockMvc.perform(post("/api/v1/loans")
                        .header("Authorization", bearer(2L, User.Role.LIBRARIAN))
                        .contentType("application/json")
                        .content("{\"memberId\":1,\"copyId\":30}"))
                .andExpect(status().isConflict())
                .andExpect(jsonPath("$.message").value("Book copy is not available: 30"));
    }

    @Test
    void issueRejectedWhenBorrowingLimitReached() throws Exception {
        stubIssuePreconditions(BigDecimal.ZERO, 3L, BookCopy.Status.AVAILABLE);

        mockMvc.perform(post("/api/v1/loans")
                        .header("Authorization", bearer(2L, User.Role.LIBRARIAN))
                        .contentType("application/json")
                        .content("{\"memberId\":1,\"copyId\":30}"))
                .andExpect(status().isConflict())
                .andExpect(jsonPath("$.message").value("Member has reached the borrowing limit"));
    }

    @Test
    void issueRejectedForInactiveMember() throws Exception {
        when(settingsRepository.findFirstByOrderBySettingIdAsc())
                .thenReturn(Optional.of(settings()));
        when(memberRepository.findById(1L))
                .thenReturn(Optional.of(member(1L, Member.Status.INACTIVE)));

        mockMvc.perform(post("/api/v1/loans")
                        .header("Authorization", bearer(2L, User.Role.LIBRARIAN))
                        .contentType("application/json")
                        .content("{\"memberId\":1,\"copyId\":30}"))
                .andExpect(status().isConflict())
                .andExpect(jsonPath("$.message")
                        .value("Cannot issue books to an inactive member"));
    }

    @Test
    void issueRejectedWhenOutstandingFineAtMaximum() throws Exception {
        stubIssuePreconditions(new BigDecimal("500.00"), 0L, BookCopy.Status.AVAILABLE);

        mockMvc.perform(post("/api/v1/loans")
                        .header("Authorization", bearer(2L, User.Role.LIBRARIAN))
                        .contentType("application/json")
                        .content("{\"memberId\":1,\"copyId\":30}"))
                .andExpect(status().isConflict())
                .andExpect(jsonPath("$.message")
                        .value("Member has reached the maximum outstanding fine limit"));
    }

    // ---------- Returning ----------

    @Test
    void onTimeReturnHasNoFine() throws Exception {
        BookCopy copy = copy(30L, BookCopy.Status.BORROWED);
        Loan loan = loan(50L, member(1L, Member.Status.ACTIVE), copy,
                user(2L, User.Role.LIBRARIAN),
                Loan.Status.BORROWED, LocalDate.now(clock).plusDays(3));
        when(loanRepository.findByIdForUpdate(50L)).thenReturn(Optional.of(loan));
        when(settingsRepository.findFirstByOrderBySettingIdAsc())
                .thenReturn(Optional.of(settings()));
        when(fineRepository.findByLoanLoanIdForUpdate(50L)).thenReturn(Optional.empty());

        mockMvc.perform(post("/api/v1/loans/50/return")
                        .header("Authorization", bearer(2L, User.Role.LIBRARIAN)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.loanId").value(50))
                .andExpect(jsonPath("$.status").value("RETURNED"))
                .andExpect(jsonPath("$.fine").doesNotExist());

        assertEquals(BookCopy.Status.AVAILABLE, copy.getStatus());
    }

    @Test
    void overdueReturnFinalizesAccruedFine() throws Exception {
        BookCopy copy = copy(30L, BookCopy.Status.BORROWED);
        Loan loan = loan(50L, member(1L, Member.Status.ACTIVE), copy,
                user(2L, User.Role.LIBRARIAN),
                Loan.Status.BORROWED, LocalDate.now(clock).minusDays(3));
        when(loanRepository.findByIdForUpdate(50L)).thenReturn(Optional.of(loan));
        when(settingsRepository.findFirstByOrderBySettingIdAsc())
                .thenReturn(Optional.of(settings()));
        when(fineRepository.findByLoanLoanIdForUpdate(50L)).thenReturn(Optional.empty());
        when(fineRepository.save(any(Fine.class))).thenAnswer(inv -> {
            Fine fine = inv.getArgument(0);
            fine.setFineId(9L);
            return fine;
        });

        mockMvc.perform(post("/api/v1/loans/50/return")
                        .header("Authorization", bearer(2L, User.Role.LIBRARIAN)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status").value("RETURNED"))
                .andExpect(jsonPath("$.fine.fineAmount").value(30.0))
                .andExpect(jsonPath("$.fine.status").value("UNPAID"));

        verify(fineRepository).save(any(Fine.class));
    }

    @Test
    void returnRejectedWhenLoanAlreadyReturned() throws Exception {
        Loan loan = loan(50L, member(1L, Member.Status.ACTIVE),
                copy(30L, BookCopy.Status.AVAILABLE),
                user(2L, User.Role.LIBRARIAN),
                Loan.Status.RETURNED, LocalDate.now(clock).minusDays(1));
        when(loanRepository.findByIdForUpdate(50L)).thenReturn(Optional.of(loan));

        mockMvc.perform(post("/api/v1/loans/50/return")
                        .header("Authorization", bearer(2L, User.Role.LIBRARIAN)))
                .andExpect(status().isConflict())
                .andExpect(jsonPath("$.message").value("Loan has already been returned"));
    }

    // ---------- Helpers ----------

    private void stubIssuePreconditions(BigDecimal outstanding, long activeLoans,
                                        BookCopy.Status copyStatus) {
        when(settingsRepository.findFirstByOrderBySettingIdAsc())
                .thenReturn(Optional.of(settings()));
        when(memberRepository.findById(1L))
                .thenReturn(Optional.of(member(1L, Member.Status.ACTIVE)));
        when(fineRepository.sumOutstandingByMemberAndStatuses(eq(1L), any()))
                .thenReturn(outstanding);
        when(loanRepository.countByMemberMemberIdAndStatus(1L, Loan.Status.BORROWED))
                .thenReturn(activeLoans);
        when(bookCopyRepository.findByIdForUpdate(30L))
                .thenReturn(Optional.of(copy(30L, copyStatus)));
    }

    private String bearer(Long userId, User.Role role) {
        User user = user(userId, role);
        when(userRepository.findById(userId)).thenReturn(Optional.of(user));
        return "Bearer " + tokenService.generateAccessToken(user);
    }

    private User user(Long id, User.Role role) {
        User user = new User();
        user.setUserId(id);
        user.setUsername("user" + id);
        user.setEmail("user" + id + "@example.com");
        user.setPasswordHash(passwordEncoder.encode("password123"));
        user.setRole(role);
        user.setStatus(User.Status.ACTIVE);
        return user;
    }

    private Member member(Long id, Member.Status status) {
        Member member = new Member();
        member.setMemberId(id);
        member.setUser(user(100L + id, User.Role.MEMBER));
        member.setMembershipNumber("MEM" + id);
        member.setFirstName("Test");
        member.setLastName("Member");
        member.setAdmissionNumber("ADM" + id);
        member.setStatus(status);
        return member;
    }

    private BookCopy copy(Long id, BookCopy.Status status) {
        Category category = new Category();
        category.setCategoryId(1L);
        category.setCategoryName("Computer Science");
        Book book = new Book();
        book.setBookId(20L);
        book.setCategory(category);
        book.setTitle("Clean Code");
        BookCopy copy = new BookCopy();
        copy.setCopyId(id);
        copy.setBook(book);
        copy.setAccessionNumber("ACC" + id);
        copy.setStatus(status);
        return copy;
    }

    private Loan loan(Long id, Member member, BookCopy copy, User issuedBy,
                      Loan.Status status, LocalDate dueDate) {
        Loan loan = new Loan();
        loan.setLoanId(id);
        loan.setMember(member);
        loan.setCopy(copy);
        loan.setIssuedBy(issuedBy);
        loan.setIssueDate(dueDate.minusDays(14));
        loan.setDueDate(dueDate);
        loan.setStatus(status);
        return loan;
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

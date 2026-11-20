package com.library.lms;

import com.library.lms.entity.Book;
import com.library.lms.entity.BookCopy;
import com.library.lms.entity.Category;
import com.library.lms.entity.Fine;
import com.library.lms.entity.FinePayment;
import com.library.lms.entity.Loan;
import com.library.lms.entity.Member;
import com.library.lms.entity.User;
import com.library.lms.repository.BookCopyRepository;
import com.library.lms.repository.BookRepository;
import com.library.lms.repository.FinePaymentRepository;
import com.library.lms.repository.FineRepository;
import com.library.lms.repository.LoanRepository;
import com.library.lms.repository.MemberRepository;
import com.library.lms.repository.UserRepository;
import com.library.lms.security.JwtTokenService;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

/** HTTP-level checks for Phase 8 dashboard and reports, with repositories mocked. */
@SpringBootTest
@AutoConfigureMockMvc
class DashboardAndReportTest {

    private static final LocalDate START = LocalDate.of(2026, 11, 1);
    private static final LocalDate END = LocalDate.of(2026, 11, 30);

    @Autowired
    private MockMvc mockMvc;
    @Autowired
    private JwtTokenService tokenService;
    @Autowired
    private PasswordEncoder passwordEncoder;

    @MockitoBean
    private UserRepository userRepository;
    @MockitoBean
    private BookRepository bookRepository;
    @MockitoBean
    private BookCopyRepository bookCopyRepository;
    @MockitoBean
    private MemberRepository memberRepository;
    @MockitoBean
    private LoanRepository loanRepository;
    @MockitoBean
    private FineRepository fineRepository;
    @MockitoBean
    private FinePaymentRepository paymentRepository;

    // ---------- Access control ----------

    @Test
    void memberCannotAccessDashboardOrReports() throws Exception {
        String memberToken = bearer(1L, User.Role.MEMBER);

        mockMvc.perform(get("/api/v1/dashboard/summary")
                        .header("Authorization", memberToken))
                .andExpect(status().isForbidden());

        mockMvc.perform(get("/api/v1/reports/loans")
                        .param("startDate", START.toString())
                        .param("endDate", END.toString())
                        .header("Authorization", memberToken))
                .andExpect(status().isForbidden());

        mockMvc.perform(get("/api/v1/reports/fines")
                        .param("startDate", START.toString())
                        .param("endDate", END.toString())
                        .header("Authorization", memberToken))
                .andExpect(status().isForbidden());
    }

    // ---------- Dashboard ----------

    @Test
    void summaryUsesLiveDatabaseCounts() throws Exception {
        when(bookRepository.count()).thenReturn(250L);
        when(bookCopyRepository.count()).thenReturn(420L);
        when(bookCopyRepository.countByStatus(BookCopy.Status.AVAILABLE)).thenReturn(350L);
        when(bookCopyRepository.countByStatus(BookCopy.Status.BORROWED)).thenReturn(70L);
        when(memberRepository.count()).thenReturn(180L);
        when(loanRepository.countByStatus(Loan.Status.BORROWED)).thenReturn(70L);
        when(loanRepository.countByStatusAndDueDateBefore(eq(Loan.Status.BORROWED), any(LocalDate.class)))
                .thenReturn(12L);
        when(fineRepository.sumOutstandingByStatuses(any()))
                .thenReturn(new BigDecimal("850.00"));

        mockMvc.perform(get("/api/v1/dashboard/summary")
                        .header("Authorization", bearer(2L, User.Role.LIBRARIAN)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.totalBooks").value(250))
                .andExpect(jsonPath("$.totalCopies").value(420))
                .andExpect(jsonPath("$.availableCopies").value(350))
                .andExpect(jsonPath("$.borrowedCopies").value(70))
                .andExpect(jsonPath("$.totalMembers").value(180))
                .andExpect(jsonPath("$.activeLoans").value(70))
                .andExpect(jsonPath("$.overdueLoans").value(12))
                .andExpect(jsonPath("$.unpaidFines").value(850.0));
    }

    // ---------- Reports ----------

    @Test
    void loanReportReturnsRowsFromRequestedRange() throws Exception {
        when(loanRepository.findByIssueDateBetween(START, END)).thenReturn(List.of(loan()));

        mockMvc.perform(get("/api/v1/reports/loans")
                        .param("startDate", START.toString())
                        .param("endDate", END.toString())
                        .header("Authorization", bearer(2L, User.Role.LIBRARIAN)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.startDate").value(START.toString()))
                .andExpect(jsonPath("$.endDate").value(END.toString()))
                .andExpect(jsonPath("$.totalLoans").value(1))
                .andExpect(jsonPath("$.loans[0].loanId").value(50))
                .andExpect(jsonPath("$.loans[0].bookTitle").value("Clean Code"))
                .andExpect(jsonPath("$.loans[0].status").value("BORROWED"));
    }

    @Test
    void fineReportCombinesAssessmentsAndPayments() throws Exception {
        when(fineRepository.findByAssessedAtBetween(any(LocalDateTime.class), any(LocalDateTime.class)))
                .thenReturn(List.of(fine()));
        when(paymentRepository.findByPaymentDateBetween(any(LocalDateTime.class), any(LocalDateTime.class)))
                .thenReturn(List.of(payment()));

        mockMvc.perform(get("/api/v1/reports/fines")
                        .param("startDate", START.toString())
                        .param("endDate", END.toString())
                        .header("Authorization", bearer(3L, User.Role.ADMIN)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.totalFines").value(1))
                .andExpect(jsonPath("$.totalAssessed").value(50.0))
                .andExpect(jsonPath("$.totalCollected").value(20.0))
                .andExpect(jsonPath("$.fines[0].fineId").value(9))
                .andExpect(jsonPath("$.payments[0].paymentId").value(70));
    }

    @Test
    void reversedDateRangeIsRejected() throws Exception {
        mockMvc.perform(get("/api/v1/reports/loans")
                        .param("startDate", END.toString())
                        .param("endDate", START.toString())
                        .header("Authorization", bearer(2L, User.Role.LIBRARIAN)))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.message").value("startDate must not be after endDate"));
    }

    @Test
    void malformedDateIsRejected() throws Exception {
        mockMvc.perform(get("/api/v1/reports/fines")
                        .param("startDate", "not-a-date")
                        .param("endDate", END.toString())
                        .header("Authorization", bearer(2L, User.Role.LIBRARIAN)))
                .andExpect(status().isBadRequest());
    }

    @Test
    void missingDateIsRejected() throws Exception {
        mockMvc.perform(get("/api/v1/reports/loans")
                        .param("startDate", START.toString())
                        .header("Authorization", bearer(2L, User.Role.LIBRARIAN)))
                .andExpect(status().isBadRequest());
    }

    // ---------- Helpers ----------

    private String bearer(Long userId, User.Role role) {
        User user = new User();
        user.setUserId(userId);
        user.setUsername("user" + userId);
        user.setEmail("user" + userId + "@example.com");
        user.setPasswordHash(passwordEncoder.encode("password123"));
        user.setRole(role);
        user.setStatus(User.Status.ACTIVE);
        when(userRepository.findById(userId)).thenReturn(Optional.of(user));
        return "Bearer " + tokenService.generateAccessToken(user);
    }

    private Member member() {
        Member member = new Member();
        member.setMemberId(1L);
        member.setFirstName("Test");
        member.setLastName("Member");
        return member;
    }

    private Loan loan() {
        Loan loan = new Loan();
        loan.setLoanId(50L);
        loan.setMember(member());
        loan.setCopy(copy());
        User staff = new User();
        staff.setUserId(2L);
        loan.setIssuedBy(staff);
        loan.setIssueDate(START.plusDays(2));
        loan.setDueDate(START.plusDays(16));
        loan.setStatus(Loan.Status.BORROWED);
        return loan;
    }

    private BookCopy copy() {
        Category category = new Category();
        category.setCategoryId(1L);
        category.setCategoryName("Computer Science");
        Book book = new Book();
        book.setBookId(20L);
        book.setCategory(category);
        book.setTitle("Clean Code");
        BookCopy copy = new BookCopy();
        copy.setCopyId(30L);
        copy.setBook(book);
        copy.setAccessionNumber("ACC030");
        return copy;
    }

    private Fine fine() {
        Fine fine = new Fine();
        fine.setFineId(9L);
        fine.setLoan(loan());
        fine.setFineAmount(new BigDecimal("50.00"));
        fine.setAmountPaid(new BigDecimal("20.00"));
        fine.setStatus(Fine.Status.PARTIALLY_PAID);
        return fine;
    }

    private FinePayment payment() {
        FinePayment payment = new FinePayment();
        payment.setPaymentId(70L);
        payment.setFine(fine());
        User staff = new User();
        staff.setUserId(2L);
        payment.setReceivedBy(staff);
        payment.setAmount(new BigDecimal("20.00"));
        payment.setPaymentMethod(FinePayment.Method.CASH);
        return payment;
    }
}

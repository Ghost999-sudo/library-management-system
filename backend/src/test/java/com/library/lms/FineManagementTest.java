package com.library.lms;

import com.library.lms.entity.Fine;
import com.library.lms.entity.FinePayment;
import com.library.lms.entity.Loan;
import com.library.lms.entity.Member;
import com.library.lms.entity.User;
import com.library.lms.repository.FinePaymentRepository;
import com.library.lms.repository.FineRepository;
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

/** HTTP-level checks for Phase 7 fines and payments, with repositories mocked. */
@SpringBootTest
@AutoConfigureMockMvc
class FineManagementTest {

    @Autowired
    private MockMvc mockMvc;
    @Autowired
    private JwtTokenService tokenService;
    @Autowired
    private PasswordEncoder passwordEncoder;

    @MockitoBean
    private UserRepository userRepository;
    @MockitoBean
    private MemberRepository memberRepository;
    @MockitoBean
    private FineRepository fineRepository;
    @MockitoBean
    private FinePaymentRepository finePaymentRepository;

    // ---------- Access control and reads ----------

    @Test
    void memberCanReadOwnFinesButCannotRecordPayment() throws Exception {
        Member member = member(1L);
        Fine fine = fine(9L, new BigDecimal("100.00"),
                new BigDecimal("40.00"), Fine.Status.PARTIALLY_PAID);
        when(memberRepository.findByUserUserId(1L)).thenReturn(Optional.of(member));
        when(fineRepository.findByLoanMemberMemberId(eq(1L), any(Pageable.class)))
                .thenReturn(new PageImpl<>(List.of(fine), PageRequest.of(0, 20), 1));

        mockMvc.perform(get("/api/v1/fines/me")
                        .header("Authorization", bearer(1L, User.Role.MEMBER)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.content[0].fineId").value(9))
                .andExpect(jsonPath("$.content[0].outstandingAmount").value(60.0));

        verify(memberRepository).findByUserUserId(1L);

        mockMvc.perform(post("/api/v1/fines/9/payments")
                        .header("Authorization", bearer(1L, User.Role.MEMBER))
                        .contentType("application/json")
                        .content("{\"amount\":10.00,\"paymentMethod\":\"CASH\"}"))
                .andExpect(status().isForbidden());
    }

    @Test
    void staffCanListAndReadFines() throws Exception {
        when(fineRepository.findAll(any(Pageable.class)))
                .thenReturn(new PageImpl<>(List.of(), PageRequest.of(0, 20), 0));
        when(fineRepository.findById(9L)).thenReturn(Optional.of(
                fine(9L, new BigDecimal("50.00"), BigDecimal.ZERO, Fine.Status.UNPAID)));

        mockMvc.perform(get("/api/v1/fines")
                        .header("Authorization", bearer(2L, User.Role.LIBRARIAN)))
                .andExpect(status().isOk());

        mockMvc.perform(get("/api/v1/fines/9")
                        .header("Authorization", bearer(2L, User.Role.LIBRARIAN)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status").value("UNPAID"));
    }

    // ---------- Payments ----------

    @Test
    void partialPaymentUpdatesFineStatus() throws Exception {
        Fine fine = fine(9L, new BigDecimal("100.00"), BigDecimal.ZERO, Fine.Status.UNPAID);
        when(fineRepository.findByIdForUpdate(9L)).thenReturn(Optional.of(fine));
        when(userRepository.getReferenceById(2L)).thenReturn(user(2L, User.Role.LIBRARIAN));
        when(finePaymentRepository.save(any(FinePayment.class))).thenAnswer(inv -> {
            FinePayment payment = inv.getArgument(0);
            payment.setPaymentId(70L);
            return payment;
        });

        mockMvc.perform(post("/api/v1/fines/9/payments")
                        .header("Authorization", bearer(2L, User.Role.LIBRARIAN))
                        .contentType("application/json")
                        .content("{\"amount\":40.00,\"paymentMethod\":\"CASH\","
                                + "\"referenceNumber\":\"RCPT001\"}"))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.paymentId").value(70))
                .andExpect(jsonPath("$.fineId").value(9))
                .andExpect(jsonPath("$.amount").value(40.0))
                .andExpect(jsonPath("$.paymentMethod").value("CASH"))
                .andExpect(jsonPath("$.referenceNumber").value("RCPT001"))
                .andExpect(jsonPath("$.receivedBy").value(2));

        assertEquals(Fine.Status.PARTIALLY_PAID, fine.getStatus());
        assertEquals(0, new BigDecimal("40.00").compareTo(fine.getAmountPaid()));
        verify(fineRepository).save(fine);
    }

    @Test
    void fullPaymentMarksFinePaid() throws Exception {
        Fine fine = fine(9L, new BigDecimal("50.00"), BigDecimal.ZERO, Fine.Status.UNPAID);
        when(fineRepository.findByIdForUpdate(9L)).thenReturn(Optional.of(fine));
        when(userRepository.getReferenceById(2L)).thenReturn(user(2L, User.Role.LIBRARIAN));
        when(finePaymentRepository.save(any(FinePayment.class))).thenAnswer(inv -> inv.getArgument(0));

        mockMvc.perform(post("/api/v1/fines/9/payments")
                        .header("Authorization", bearer(2L, User.Role.LIBRARIAN))
                        .contentType("application/json")
                        .content("{\"amount\":50.00,\"paymentMethod\":\"OTHER\"}"))
                .andExpect(status().isCreated());

        assertEquals(Fine.Status.PAID, fine.getStatus());
    }

    @Test
    void paymentRejectedWhenItExceedsOutstandingBalance() throws Exception {
        Fine fine = fine(9L, new BigDecimal("10.00"), new BigDecimal("5.00"),
                Fine.Status.PARTIALLY_PAID);
        when(fineRepository.findByIdForUpdate(9L)).thenReturn(Optional.of(fine));

        mockMvc.perform(post("/api/v1/fines/9/payments")
                        .header("Authorization", bearer(2L, User.Role.LIBRARIAN))
                        .contentType("application/json")
                        .content("{\"amount\":6.00,\"paymentMethod\":\"CASH\"}"))
                .andExpect(status().isConflict())
                .andExpect(jsonPath("$.message")
                        .value("Payment exceeds the outstanding fine balance"));
    }

    @Test
    void paymentRejectedWhenFineAlreadyPaid() throws Exception {
        Fine fine = fine(9L, new BigDecimal("10.00"), new BigDecimal("10.00"), Fine.Status.PAID);
        when(fineRepository.findByIdForUpdate(9L)).thenReturn(Optional.of(fine));

        mockMvc.perform(post("/api/v1/fines/9/payments")
                        .header("Authorization", bearer(2L, User.Role.LIBRARIAN))
                        .contentType("application/json")
                        .content("{\"amount\":1.00,\"paymentMethod\":\"CASH\"}"))
                .andExpect(status().isConflict())
                .andExpect(jsonPath("$.message").value("Fine is already settled: 9"));
    }

    @Test
    void paymentAmountMustBePositive() throws Exception {
        mockMvc.perform(post("/api/v1/fines/9/payments")
                        .header("Authorization", bearer(2L, User.Role.LIBRARIAN))
                        .contentType("application/json")
                        .content("{\"amount\":0,\"paymentMethod\":\"CASH\"}"))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.status").value(400));
    }

    @Test
    void paymentHistoryReturned() throws Exception {
        Fine fine = fine(9L, new BigDecimal("10.00"), BigDecimal.ZERO, Fine.Status.UNPAID);
        FinePayment payment = new FinePayment();
        payment.setPaymentId(70L);
        payment.setFine(fine);
        payment.setReceivedBy(user(2L, User.Role.LIBRARIAN));
        payment.setAmount(new BigDecimal("10.00"));
        payment.setPaymentMethod(FinePayment.Method.CASH);

        when(fineRepository.findById(9L)).thenReturn(Optional.of(fine));
        when(finePaymentRepository.findByFineFineId(9L)).thenReturn(List.of(payment));

        mockMvc.perform(get("/api/v1/fines/9/payments")
                        .header("Authorization", bearer(2L, User.Role.LIBRARIAN)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].paymentId").value(70))
                .andExpect(jsonPath("$[0].amount").value(10.0));
    }

    // ---------- Helpers ----------

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

    private Member member(Long id) {
        Member member = new Member();
        member.setMemberId(id);
        member.setUser(user(100L + id, User.Role.MEMBER));
        member.setFirstName("Test");
        member.setLastName("Member");
        return member;
    }

    private Fine fine(Long id, BigDecimal amount, BigDecimal paid, Fine.Status status) {
        Loan loan = new Loan();
        loan.setLoanId(50L);
        loan.setMember(member(1L));
        loan.setIssueDate(LocalDate.now().minusDays(30));
        loan.setDueDate(LocalDate.now().minusDays(5));
        Fine fine = new Fine();
        fine.setFineId(id);
        fine.setLoan(loan);
        fine.setFineAmount(amount);
        fine.setAmountPaid(paid);
        fine.setStatus(status);
        return fine;
    }
}

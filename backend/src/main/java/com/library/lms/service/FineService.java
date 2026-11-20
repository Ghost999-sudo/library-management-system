package com.library.lms.service;

import com.library.lms.dto.request.FinePaymentRequest;
import com.library.lms.dto.response.FinePaymentResponse;
import com.library.lms.dto.response.FineResponse;
import com.library.lms.dto.response.PagedResponse;
import com.library.lms.entity.Fine;
import com.library.lms.entity.FinePayment;
import com.library.lms.exception.BusinessRuleException;
import com.library.lms.exception.ResourceNotFoundException;
import com.library.lms.repository.FinePaymentRepository;
import com.library.lms.repository.FineRepository;
import com.library.lms.repository.MemberRepository;
import com.library.lms.repository.UserRepository;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.List;

/** Fine lookup and manual payment recording (section 13 of the REST API documentation). */
@Service
@Transactional(readOnly = true)
public class FineService {

    private final FineRepository fineRepository;
    private final FinePaymentRepository paymentRepository;
    private final MemberRepository memberRepository;
    private final UserRepository userRepository;

    public FineService(FineRepository fineRepository,
                       FinePaymentRepository paymentRepository,
                       MemberRepository memberRepository,
                       UserRepository userRepository) {
        this.fineRepository = fineRepository;
        this.paymentRepository = paymentRepository;
        this.memberRepository = memberRepository;
        this.userRepository = userRepository;
    }

    public PagedResponse<FineResponse> getAll(Pageable pageable) {
        return PagedResponse.from(fineRepository.findAll(pageable), FineResponse::new);
    }

    public FineResponse getById(Long fineId) {
        return new FineResponse(findFine(fineId));
    }

    /** Members only see fines attached to their own loans. */
    public PagedResponse<FineResponse> getMyFines(Long userId, Pageable pageable) {
        Long memberId = memberRepository.findByUserUserId(userId)
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Member profile not found for the current user"))
                .getMemberId();
        return PagedResponse.from(
                fineRepository.findByLoanMemberMemberId(memberId, pageable), FineResponse::new);
    }

    /**
     * Records a cash/other payment and keeps the fine's paid total in step with it.
     * The fine row is locked so two concurrent payments cannot overpay the balance.
     */
    @Transactional
    public FinePaymentResponse recordPayment(Long fineId, FinePaymentRequest request,
                                             Long staffUserId) {
        Fine fine = fineRepository.findByIdForUpdate(fineId)
                .orElseThrow(() -> new ResourceNotFoundException("Fine not found: " + fineId));

        if (fine.getStatus() == Fine.Status.PAID || fine.getStatus() == Fine.Status.WAIVED) {
            throw new BusinessRuleException("Fine is already settled: " + fineId);
        }
        if (request.getAmount() == null || request.getAmount().compareTo(BigDecimal.ZERO) <= 0) {
            throw new BusinessRuleException("Payment amount must be positive");
        }

        BigDecimal outstanding = fine.getFineAmount().subtract(fine.getAmountPaid());
        if (request.getAmount().compareTo(outstanding) > 0) {
            throw new BusinessRuleException("Payment exceeds the outstanding fine balance");
        }

        FinePayment payment = new FinePayment();
        payment.setFine(fine);
        payment.setReceivedBy(userRepository.getReferenceById(staffUserId));
        payment.setAmount(request.getAmount());
        payment.setPaymentMethod(request.getPaymentMethod());
        payment.setReferenceNumber(request.getReferenceNumber());
        FinePayment saved = paymentRepository.save(payment);

        BigDecimal newPaid = fine.getAmountPaid().add(request.getAmount());
        fine.setAmountPaid(newPaid);
        fine.setStatus(newPaid.compareTo(fine.getFineAmount()) >= 0
                ? Fine.Status.PAID : Fine.Status.PARTIALLY_PAID);
        fineRepository.save(fine);

        return new FinePaymentResponse(saved);
    }

    public List<FinePaymentResponse> getPayments(Long fineId) {
        findFine(fineId); // 404 when the parent fine does not exist
        return paymentRepository.findByFineFineId(fineId).stream()
                .map(FinePaymentResponse::new)
                .toList();
    }

    private Fine findFine(Long fineId) {
        return fineRepository.findById(fineId)
                .orElseThrow(() -> new ResourceNotFoundException("Fine not found: " + fineId));
    }
}

package com.library.lms.service;

import com.library.lms.dto.response.FineReportItem;
import com.library.lms.dto.response.FineReportResponse;
import com.library.lms.dto.response.LoanReportItem;
import com.library.lms.dto.response.LoanReportResponse;
import com.library.lms.dto.response.PaymentReportItem;
import com.library.lms.exception.InvalidRequestException;
import com.library.lms.repository.FinePaymentRepository;
import com.library.lms.repository.FineRepository;
import com.library.lms.repository.LoanRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.List;

/** Date-range reports (sections 15.2 and 15.3). */
@Service
@Transactional(readOnly = true)
public class ReportService {

    private final LoanRepository loanRepository;
    private final FineRepository fineRepository;
    private final FinePaymentRepository paymentRepository;

    public ReportService(LoanRepository loanRepository,
                         FineRepository fineRepository,
                         FinePaymentRepository paymentRepository) {
        this.loanRepository = loanRepository;
        this.fineRepository = fineRepository;
        this.paymentRepository = paymentRepository;
    }

    public LoanReportResponse loanReport(LocalDate startDate, LocalDate endDate) {
        validateRange(startDate, endDate);
        List<LoanReportItem> loans = loanRepository.findByIssueDateBetween(startDate, endDate)
                .stream().map(LoanReportItem::new).toList();
        return new LoanReportResponse(startDate, endDate, loans);
    }

    public FineReportResponse fineReport(LocalDate startDate, LocalDate endDate) {
        validateRange(startDate, endDate);
        LocalDateTime from = startDate.atStartOfDay();
        LocalDateTime to = endDate.atTime(LocalTime.MAX);

        List<FineReportItem> fines = fineRepository.findByAssessedAtBetween(from, to)
                .stream().map(FineReportItem::new).toList();
        List<PaymentReportItem> payments = paymentRepository.findByPaymentDateBetween(from, to)
                .stream().map(PaymentReportItem::new).toList();

        BigDecimal totalAssessed = fines.stream()
                .map(FineReportItem::getFineAmount)
                .reduce(BigDecimal.ZERO, BigDecimal::add);
        BigDecimal totalCollected = payments.stream()
                .map(PaymentReportItem::getAmount)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        return new FineReportResponse(startDate, endDate, fines, payments,
                totalAssessed, totalCollected);
    }

    private void validateRange(LocalDate startDate, LocalDate endDate) {
        if (startDate == null || endDate == null) {
            throw new InvalidRequestException("Both startDate and endDate are required");
        }
        if (startDate.isAfter(endDate)) {
            throw new InvalidRequestException("startDate must not be after endDate");
        }
    }
}

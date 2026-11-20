package com.library.lms.dto.response;

import lombok.Getter;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

/** Response for GET /api/v1/reports/fines (section 15.3). */
@Getter
public class FineReportResponse {

    private final LocalDate startDate;
    private final LocalDate endDate;
    private final long totalFines;
    private final BigDecimal totalAssessed;
    private final BigDecimal totalCollected;
    private final List<FineReportItem> fines;
    private final List<PaymentReportItem> payments;

    public FineReportResponse(LocalDate startDate, LocalDate endDate,
                              List<FineReportItem> fines, List<PaymentReportItem> payments,
                              BigDecimal totalAssessed, BigDecimal totalCollected) {
        this.startDate = startDate;
        this.endDate = endDate;
        this.totalFines = fines.size();
        this.fines = fines;
        this.payments = payments;
        this.totalAssessed = totalAssessed;
        this.totalCollected = totalCollected;
    }
}

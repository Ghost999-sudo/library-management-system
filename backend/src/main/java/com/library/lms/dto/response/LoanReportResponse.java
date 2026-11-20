package com.library.lms.dto.response;

import lombok.Getter;

import java.time.LocalDate;
import java.util.List;

/** Response for GET /api/v1/reports/loans (section 15.2). */
@Getter
public class LoanReportResponse {

    private final LocalDate startDate;
    private final LocalDate endDate;
    private final long totalLoans;
    private final List<LoanReportItem> loans;

    public LoanReportResponse(LocalDate startDate, LocalDate endDate, List<LoanReportItem> loans) {
        this.startDate = startDate;
        this.endDate = endDate;
        this.totalLoans = loans.size();
        this.loans = loans;
    }
}

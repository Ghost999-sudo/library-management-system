package com.library.lms.dto.response;

import lombok.Getter;

import java.math.BigDecimal;

/** High-level statistics for GET /api/v1/dashboard/summary (section 15.1). */
@Getter
public class DashboardSummaryResponse {

    private final long totalBooks;
    private final long totalCopies;
    private final long availableCopies;
    private final long borrowedCopies;
    private final long totalMembers;
    private final long activeLoans;
    private final long overdueLoans;
    private final BigDecimal unpaidFines;

    public DashboardSummaryResponse(long totalBooks, long totalCopies, long availableCopies,
                                    long borrowedCopies, long totalMembers, long activeLoans,
                                    long overdueLoans, BigDecimal unpaidFines) {
        this.totalBooks = totalBooks;
        this.totalCopies = totalCopies;
        this.availableCopies = availableCopies;
        this.borrowedCopies = borrowedCopies;
        this.totalMembers = totalMembers;
        this.activeLoans = activeLoans;
        this.overdueLoans = overdueLoans;
        this.unpaidFines = unpaidFines;
    }
}

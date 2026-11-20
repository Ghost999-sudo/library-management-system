package com.library.lms.dto.response;

import com.library.lms.entity.Fine;
import com.library.lms.entity.Loan;
import lombok.Getter;

import java.time.LocalDate;

/** Response for POST /api/v1/loans/{loanId}/return; fine is null when none applies. */
@Getter
public class ReturnResponse {

    private final Long loanId;
    private final LocalDate returnDate;
    private final Loan.Status status;
    private final FineSummary fine;

    public ReturnResponse(Loan loan, Fine fine) {
        this.loanId = loan.getLoanId();
        this.returnDate = loan.getReturnDate();
        this.status = loan.getStatus();
        this.fine = fine == null ? null : new FineSummary(fine);
    }
}

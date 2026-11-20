package com.library.lms.dto.response;

import com.library.lms.entity.Fine;
import lombok.Getter;

import java.math.BigDecimal;

/** Fine view with the remaining balance, so the frontend does not recalculate it. */
@Getter
public class FineResponse {

    private final Long fineId;
    private final Long loanId;
    private final Long memberId;
    private final String memberName;
    private final BigDecimal fineAmount;
    private final BigDecimal amountPaid;
    private final BigDecimal outstandingAmount;
    private final Fine.Status status;

    public FineResponse(Fine fine) {
        this.fineId = fine.getFineId();
        this.loanId = fine.getLoan().getLoanId();
        this.memberId = fine.getLoan().getMember().getMemberId();
        this.memberName = fine.getLoan().getMember().getFirstName()
                + " " + fine.getLoan().getMember().getLastName();
        this.fineAmount = fine.getFineAmount();
        this.amountPaid = fine.getAmountPaid();
        this.outstandingAmount = fine.getFineAmount().subtract(fine.getAmountPaid());
        this.status = fine.getStatus();
    }
}

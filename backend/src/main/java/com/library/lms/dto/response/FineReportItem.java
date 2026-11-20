package com.library.lms.dto.response;

import com.library.lms.entity.Fine;
import lombok.Getter;

import java.math.BigDecimal;

/** One assessed fine in the fine date-range report. */
@Getter
public class FineReportItem {

    private final Long fineId;
    private final Long loanId;
    private final String memberName;
    private final BigDecimal fineAmount;
    private final BigDecimal amountPaid;
    private final Fine.Status status;

    public FineReportItem(Fine fine) {
        this.fineId = fine.getFineId();
        this.loanId = fine.getLoan().getLoanId();
        this.memberName = fine.getLoan().getMember().getFirstName()
                + " " + fine.getLoan().getMember().getLastName();
        this.fineAmount = fine.getFineAmount();
        this.amountPaid = fine.getAmountPaid();
        this.status = fine.getStatus();
    }
}

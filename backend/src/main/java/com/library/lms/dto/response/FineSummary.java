package com.library.lms.dto.response;

import com.library.lms.entity.Fine;
import lombok.Getter;

import java.math.BigDecimal;

/** The small fine object embedded in the return response. */
@Getter
public class FineSummary {

    private final BigDecimal fineAmount;
    private final Fine.Status status;

    public FineSummary(Fine fine) {
        this.fineAmount = fine.getFineAmount();
        this.status = fine.getStatus();
    }
}

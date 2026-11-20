package com.library.lms.dto.response;

import com.library.lms.entity.FinePayment;
import lombok.Getter;

import java.math.BigDecimal;

/** One collected payment in the fine date-range report. */
@Getter
public class PaymentReportItem {

    private final Long paymentId;
    private final Long fineId;
    private final BigDecimal amount;
    private final FinePayment.Method paymentMethod;
    private final Long receivedBy;

    public PaymentReportItem(FinePayment payment) {
        this.paymentId = payment.getPaymentId();
        this.fineId = payment.getFine().getFineId();
        this.amount = payment.getAmount();
        this.paymentMethod = payment.getPaymentMethod();
        this.receivedBy = payment.getReceivedBy().getUserId();
    }
}

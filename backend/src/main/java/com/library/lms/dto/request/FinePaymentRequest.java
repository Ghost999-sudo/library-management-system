package com.library.lms.dto.request;

import com.library.lms.entity.FinePayment;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.math.BigDecimal;

/** Payload for POST /api/v1/fines/{fineId}/payments. */
@Getter
@Setter
@NoArgsConstructor
public class FinePaymentRequest {

    @NotNull(message = "Amount is required")
    @DecimalMin(value = "0.01", message = "Payment amount must be positive")
    private BigDecimal amount;

    @NotNull(message = "Payment method is required")
    private FinePayment.Method paymentMethod;

    @Size(max = 100, message = "Reference number is too long")
    private String referenceNumber;
}

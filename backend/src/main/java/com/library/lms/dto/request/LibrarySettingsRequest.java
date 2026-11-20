package com.library.lms.dto.request;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import jakarta.validation.constraints.PositiveOrZero;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.math.BigDecimal;

/** Payload for PUT /api/v1/settings. Values are validated before the single record is updated. */
@Getter
@Setter
@NoArgsConstructor
public class LibrarySettingsRequest {

    @NotNull(message = "Borrowing limit is required")
    @Positive(message = "Borrowing limit must be positive")
    private Integer borrowingLimit;

    @NotNull(message = "Borrowing period is required")
    @Positive(message = "Borrowing period must be positive")
    private Integer borrowingPeriodDays;

    @NotNull(message = "Fine per day is required")
    @DecimalMin(value = "0.00", message = "Fine per day cannot be negative")
    private BigDecimal finePerDay;

    @NotNull(message = "Fine grace period is required")
    @PositiveOrZero(message = "Fine grace period cannot be negative")
    private Integer fineGracePeriodDays;

    @NotNull(message = "Maximum outstanding fine is required")
    @DecimalMin(value = "0.00", message = "Maximum outstanding fine cannot be negative")
    private BigDecimal maxOutstandingFine;
}

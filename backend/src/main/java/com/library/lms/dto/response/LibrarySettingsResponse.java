package com.library.lms.dto.response;

import com.library.lms.entity.LibrarySettings;
import lombok.Getter;

import java.math.BigDecimal;

/** The single active library configuration record. */
@Getter
public class LibrarySettingsResponse {

    private final Long settingId;
    private final Integer borrowingLimit;
    private final Integer borrowingPeriodDays;
    private final BigDecimal finePerDay;
    private final Integer fineGracePeriodDays;
    private final BigDecimal maxOutstandingFine;

    public LibrarySettingsResponse(LibrarySettings settings) {
        this.settingId = settings.getSettingId();
        this.borrowingLimit = settings.getBorrowingLimit();
        this.borrowingPeriodDays = settings.getBorrowingPeriodDays();
        this.finePerDay = settings.getFinePerDay();
        this.fineGracePeriodDays = settings.getFineGracePeriodDays();
        this.maxOutstandingFine = settings.getMaxOutstandingFine();
    }
}

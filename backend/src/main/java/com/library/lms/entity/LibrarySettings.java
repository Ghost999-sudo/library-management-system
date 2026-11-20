package com.library.lms.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.math.BigDecimal;

/** Maps the existing library_settings table. The backend enforces a single record. */
@Entity
@Table(name = "library_settings")
@Getter
@Setter
@NoArgsConstructor
public class LibrarySettings {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "setting_id")
    private Long settingId;

    @Column(name = "borrowing_limit", nullable = false)
    private Integer borrowingLimit;

    @Column(name = "borrowing_period_days", nullable = false)
    private Integer borrowingPeriodDays;

    @Column(name = "fine_per_day", nullable = false, precision = 10, scale = 2)
    private BigDecimal finePerDay;

    @Column(name = "fine_grace_period_days", nullable = false)
    private Integer fineGracePeriodDays;

    @Column(name = "max_outstanding_fine", nullable = false, precision = 10, scale = 2)
    private BigDecimal maxOutstandingFine;
}

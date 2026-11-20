package com.library.lms.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.OneToMany;
import jakarta.persistence.OneToOne;
import jakarta.persistence.Table;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

/** Maps the existing fines table. The unique loan_id enforces one fine per loan. */
@Entity
@Table(name = "fines")
@Getter
@Setter
@NoArgsConstructor
public class Fine {

    public enum Status { UNPAID, PARTIALLY_PAID, PAID, WAIVED }

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "fine_id")
    private Long fineId;

    @OneToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "loan_id", nullable = false, unique = true)
    private Loan loan;

    @Column(name = "fine_amount", nullable = false, precision = 10, scale = 2)
    private BigDecimal fineAmount;

    @Column(name = "amount_paid", nullable = false, precision = 10, scale = 2)
    private BigDecimal amountPaid = BigDecimal.ZERO;

    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false,
            columnDefinition = "enum('UNPAID','PARTIALLY_PAID','PAID','WAIVED')")
    private Status status = Status.UNPAID;

    /* Database supplies the value on insert. */
    @Column(name = "assessed_at", nullable = false, insertable = false, updatable = false)
    private LocalDateTime assessedAt;

    @OneToMany(mappedBy = "fine", fetch = FetchType.LAZY)
    private List<FinePayment> payments = new ArrayList<>();
}

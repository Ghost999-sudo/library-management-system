package com.library.lms.repository;

import com.library.lms.entity.Fine;
import jakarta.persistence.LockModeType;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.Collection;
import java.util.List;
import java.util.Optional;

public interface FineRepository extends JpaRepository<Fine, Long> {

    Optional<Fine> findByLoanLoanId(Long loanId);

    boolean existsByLoanLoanId(Long loanId);

    List<Fine> findByLoanMemberMemberId(Long memberId);

    Page<Fine> findByLoanMemberMemberId(Long memberId, Pageable pageable);

    List<Fine> findByStatus(Fine.Status status);

    List<Fine> findByAssessedAtBetween(LocalDateTime start, LocalDateTime end);

    /** Remaining balance for the statuses that still represent money owed. */
    @Query("select coalesce(sum(f.fineAmount - f.amountPaid), 0.00) from Fine f " +
            "where f.status in :statuses")
    BigDecimal sumOutstandingByStatuses(@Param("statuses") Collection<Fine.Status> statuses);

    /** Per-member balance, used to apply max_outstanding_fine when issuing a book. */
    @Query("select coalesce(sum(f.fineAmount - f.amountPaid), 0.00) from Fine f " +
            "where f.loan.member.memberId = :memberId and f.status in :statuses")
    BigDecimal sumOutstandingByMemberAndStatuses(@Param("memberId") Long memberId,
                                                 @Param("statuses") Collection<Fine.Status> statuses);

    /** Locks the fine row so two concurrent payments cannot overpay it. */
    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("select f from Fine f where f.fineId = :fineId")
    Optional<Fine> findByIdForUpdate(@Param("fineId") Long fineId);

    /** Locks the fine for a loan so accrual/return and payments do not race. */
    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("select f from Fine f where f.loan.loanId = :loanId")
    Optional<Fine> findByLoanLoanIdForUpdate(@Param("loanId") Long loanId);
}

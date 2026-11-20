package com.library.lms.repository;

import com.library.lms.entity.Loan;
import jakarta.persistence.LockModeType;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

public interface LoanRepository extends JpaRepository<Loan, Long> {

    List<Loan> findByMemberMemberId(Long memberId);

    Page<Loan> findByMemberMemberId(Long memberId, Pageable pageable);

    List<Loan> findByCopyCopyId(Long copyId);

    Optional<Loan> findByCopyCopyIdAndStatus(Long copyId, Loan.Status status);

    boolean existsByCopyCopyIdAndStatus(Long copyId, Loan.Status status);

    /** Used to reject deleting a book that still has loan history on any of its copies. */
    boolean existsByCopyBookBookId(Long bookId);

    long countByMemberMemberIdAndStatus(Long memberId, Loan.Status status);

    long countByStatus(Loan.Status status);

    List<Loan> findByStatusAndDueDateBefore(Loan.Status status, LocalDate date);

    Page<Loan> findByStatusAndDueDateBefore(Loan.Status status, LocalDate date, Pageable pageable);

    long countByStatusAndDueDateBefore(Loan.Status status, LocalDate date);

    List<Loan> findByIssueDateBetween(LocalDate startDate, LocalDate endDate);

    /** Locks the loan row so a return cannot be processed twice concurrently. */
    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("select l from Loan l where l.loanId = :loanId")
    Optional<Loan> findByIdForUpdate(@Param("loanId") Long loanId);
}

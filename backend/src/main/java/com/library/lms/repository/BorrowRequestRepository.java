package com.library.lms.repository;

import com.library.lms.entity.BorrowRequest;
import jakarta.persistence.LockModeType;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.Optional;

public interface BorrowRequestRepository extends JpaRepository<BorrowRequest, Long> {

    Page<BorrowRequest> findByMemberMemberId(Long memberId, Pageable pageable);

    Page<BorrowRequest> findByStatus(BorrowRequest.Status status, Pageable pageable);

    boolean existsByMemberMemberIdAndBookBookIdAndStatus(
            Long memberId, Long bookId, BorrowRequest.Status status);

    /** Locks the row so a request cannot be approved or rejected twice concurrently. */
    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("select r from BorrowRequest r where r.requestId = :requestId")
    Optional<BorrowRequest> findByIdForUpdate(@Param("requestId") Long requestId);
}

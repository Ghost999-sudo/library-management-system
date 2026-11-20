package com.library.lms.repository;

import com.library.lms.entity.BookCopy;
import jakarta.persistence.LockModeType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface BookCopyRepository extends JpaRepository<BookCopy, Long> {

    List<BookCopy> findByBookBookId(Long bookId);

    List<BookCopy> findByBookBookIdAndStatus(Long bookId, BookCopy.Status status);

    long countByBookBookId(Long bookId);

    long countByStatus(BookCopy.Status status);

    Optional<BookCopy> findByAccessionNumber(String accessionNumber);

    boolean existsByAccessionNumber(String accessionNumber);

    /**
     * Locks the physical copy row so two concurrent requests cannot both issue
     * the same copy. Phase 7 uses this inside the issuing transaction.
     */
    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("select c from BookCopy c where c.copyId = :copyId")
    Optional<BookCopy> findByIdForUpdate(@Param("copyId") Long copyId);
}

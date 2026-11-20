package com.library.lms.repository;

import com.library.lms.entity.FinePayment;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

public interface FinePaymentRepository extends JpaRepository<FinePayment, Long> {

    List<FinePayment> findByFineFineId(Long fineId);

    List<FinePayment> findByPaymentDateBetween(LocalDateTime start, LocalDateTime end);

    @Query("select coalesce(sum(p.amount), 0.00) from FinePayment p where p.fine.fineId = :fineId")
    BigDecimal sumByFineId(@Param("fineId") Long fineId);
}

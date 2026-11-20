package com.library.lms.repository;

import com.library.lms.entity.Member;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.Optional;

public interface MemberRepository extends JpaRepository<Member, Long> {

    /** Note the explicit "UserUserId": Member owns a User relationship, not a plain userId column. */
    @EntityGraph(attributePaths = "user")
    Optional<Member> findByUserUserId(Long userId);

    /** Eagerly loads the linked user so list responses do not trigger one query per row. */
    @Query(value = "select m from Member m join fetch m.user",
            countQuery = "select count(m) from Member m")
    Page<Member> findAllWithUser(Pageable pageable);

    boolean existsByUserUserId(Long userId);

    Optional<Member> findByMembershipNumber(String membershipNumber);

    boolean existsByMembershipNumber(String membershipNumber);

    Optional<Member> findByAdmissionNumber(String admissionNumber);

    boolean existsByAdmissionNumber(String admissionNumber);

    Page<Member> findByStatus(Member.Status status, Pageable pageable);

    long countByStatus(Member.Status status);
}

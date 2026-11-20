package com.library.lms.service;

import com.library.lms.dto.request.CreateMemberRequest;
import com.library.lms.dto.request.UpdateMemberRequest;
import com.library.lms.dto.response.MemberResponse;
import com.library.lms.dto.response.PagedResponse;
import com.library.lms.entity.Member;
import com.library.lms.entity.User;
import com.library.lms.exception.DuplicateResourceException;
import com.library.lms.exception.ResourceNotFoundException;
import com.library.lms.repository.MemberRepository;
import com.library.lms.repository.UserRepository;
import org.springframework.data.domain.Pageable;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@Transactional(readOnly = true)
public class MemberService {

    private final MemberRepository memberRepository;
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    public MemberService(MemberRepository memberRepository,
                         UserRepository userRepository,
                         PasswordEncoder passwordEncoder) {
        this.memberRepository = memberRepository;
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
    }

    /**
     * Creates the user account and the member record in one transaction. If either insert
     * fails, both are rolled back so a member can never exist without a login account.
     */
    @Transactional
    public MemberResponse register(CreateMemberRequest request) {
        String username = request.getUsername().trim();
        String email = request.getEmail().trim();
        String membershipNumber = request.getMembershipNumber().trim();
        String admissionNumber = request.getAdmissionNumber().trim();

        validateUniqueUser(username, email);
        if (memberRepository.existsByMembershipNumber(membershipNumber)) {
            throw new DuplicateResourceException(
                    "Membership number is already in use: " + membershipNumber);
        }
        if (memberRepository.existsByAdmissionNumber(admissionNumber)) {
            throw new DuplicateResourceException(
                    "Admission number is already in use: " + admissionNumber);
        }

        User user = new User();
        user.setUsername(username);
        user.setEmail(email);
        user.setPasswordHash(passwordEncoder.encode(request.getPassword()));
        user.setRole(User.Role.MEMBER);
        user.setStatus(User.Status.ACTIVE);
        User savedUser = userRepository.save(user);

        Member member = new Member();
        member.setUser(savedUser);
        member.setMembershipNumber(membershipNumber);
        member.setFirstName(request.getFirstName().trim());
        member.setLastName(request.getLastName().trim());
        member.setAdmissionNumber(admissionNumber);
        member.setPhone(request.getPhone());
        member.setDepartment(request.getDepartment());
        member.setRegistrationDate(request.getRegistrationDate());
        member.setStatus(Member.Status.ACTIVE);
        return new MemberResponse(memberRepository.save(member));
    }

    public PagedResponse<MemberResponse> getAll(Pageable pageable) {
        return PagedResponse.from(memberRepository.findAllWithUser(pageable), MemberResponse::new);
    }

    public MemberResponse getById(Long memberId) {
        return new MemberResponse(findMember(memberId));
    }

    /** Resolves the profile from the authenticated user id — no client-supplied id involved. */
    public MemberResponse getMyProfile(Long userId) {
        Member member = memberRepository.findByUserUserId(userId)
                .orElseThrow(() -> new ResourceNotFoundException(
                        "No member profile is linked to this user"));
        return new MemberResponse(member);
    }

    @Transactional
    public MemberResponse update(Long memberId, UpdateMemberRequest request) {
        Member member = findMember(memberId);
        String membershipNumber = request.getMembershipNumber().trim();
        String admissionNumber = request.getAdmissionNumber().trim();

        memberRepository.findByMembershipNumber(membershipNumber)
                .filter(other -> !other.getMemberId().equals(memberId))
                .ifPresent(other -> {
                    throw new DuplicateResourceException(
                            "Membership number is already in use: " + membershipNumber);
                });
        memberRepository.findByAdmissionNumber(admissionNumber)
                .filter(other -> !other.getMemberId().equals(memberId))
                .ifPresent(other -> {
                    throw new DuplicateResourceException(
                            "Admission number is already in use: " + admissionNumber);
                });

        member.setMembershipNumber(membershipNumber);
        member.setFirstName(request.getFirstName().trim());
        member.setLastName(request.getLastName().trim());
        member.setAdmissionNumber(admissionNumber);
        member.setPhone(request.getPhone());
        member.setDepartment(request.getDepartment());
        member.setRegistrationDate(request.getRegistrationDate());
        return new MemberResponse(memberRepository.save(member));
    }

    @Transactional
    public MemberResponse changeStatus(Long memberId, Member.Status status) {
        Member member = findMember(memberId);
        member.setStatus(status);
        return new MemberResponse(memberRepository.save(member));
    }

    private void validateUniqueUser(String username, String email) {
        if (userRepository.existsByUsername(username)) {
            throw new DuplicateResourceException("Username is already in use: " + username);
        }
        if (userRepository.existsByEmail(email)) {
            throw new DuplicateResourceException("Email is already in use: " + email);
        }
    }

    private Member findMember(Long memberId) {
        return memberRepository.findById(memberId)
                .orElseThrow(() -> new ResourceNotFoundException("Member not found: " + memberId));
    }
}

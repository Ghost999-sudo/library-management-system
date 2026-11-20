package com.library.lms.dto.response;

import com.library.lms.entity.Member;
import lombok.Getter;

import java.time.LocalDate;

/** Member view with the linked user's basic details flattened for the frontend. */
@Getter
public class MemberResponse {

    private final Long memberId;
    private final Long userId;
    private final String username;
    private final String email;
    private final String membershipNumber;
    private final String firstName;
    private final String lastName;
    private final String admissionNumber;
    private final String phone;
    private final String department;
    private final LocalDate registrationDate;
    private final String status;

    public MemberResponse(Member member) {
        this.memberId = member.getMemberId();
        this.userId = member.getUser().getUserId();
        this.username = member.getUser().getUsername();
        this.email = member.getUser().getEmail();
        this.membershipNumber = member.getMembershipNumber();
        this.firstName = member.getFirstName();
        this.lastName = member.getLastName();
        this.admissionNumber = member.getAdmissionNumber();
        this.phone = member.getPhone();
        this.department = member.getDepartment();
        this.registrationDate = member.getRegistrationDate();
        this.status = member.getStatus().name();
    }
}

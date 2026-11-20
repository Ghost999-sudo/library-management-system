package com.library.lms.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDate;

/** Payload for PUT /api/v1/members/{memberId}. User account fields are not editable here. */
@Getter
@Setter
@NoArgsConstructor
public class UpdateMemberRequest {

    @NotBlank(message = "Membership number is required")
    @Size(max = 30)
    private String membershipNumber;

    @NotBlank(message = "First name is required")
    @Size(max = 60)
    private String firstName;

    @NotBlank(message = "Last name is required")
    @Size(max = 60)
    private String lastName;

    @NotBlank(message = "Admission number is required")
    @Size(max = 40)
    private String admissionNumber;

    @Size(max = 20)
    private String phone;

    @Size(max = 100)
    private String department;

    @NotNull(message = "Registration date is required")
    private LocalDate registrationDate;
}

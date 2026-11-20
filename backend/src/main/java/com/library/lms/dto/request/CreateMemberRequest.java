package com.library.lms.dto.request;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDate;

/** Payload for POST /api/v1/members. Creates both the user account and the member. */
@Getter
@Setter
@NoArgsConstructor
public class CreateMemberRequest {

    @NotBlank(message = "Username is required")
    @Size(max = 50)
    private String username;

    @NotBlank(message = "Email is required")
    @Email(message = "Email must be valid")
    @Size(max = 100)
    private String email;

    @NotBlank(message = "Password is required")
    @Size(min = 8, max = 100, message = "Password must be at least 8 characters")
    private String password;

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

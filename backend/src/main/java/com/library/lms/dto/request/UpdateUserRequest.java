package com.library.lms.dto.request;

import com.library.lms.entity.User;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

/** Payload for PUT /api/v1/users/{userId}. Password is optional (leave blank to keep it). */
@Getter
@Setter
@NoArgsConstructor
public class UpdateUserRequest {

    @NotBlank(message = "Email is required")
    @Email(message = "Email must be valid")
    @Size(max = 100)
    private String email;

    @NotNull(message = "Role is required")
    private User.Role role;

    @Size(min = 8, max = 100, message = "Password must be at least 8 characters")
    private String password;
}

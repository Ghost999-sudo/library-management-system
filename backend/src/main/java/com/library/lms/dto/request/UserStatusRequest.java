package com.library.lms.dto.request;

import com.library.lms.entity.User;
import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

/** Payload for PATCH /api/v1/users/{userId}/status. */
@Getter
@Setter
@NoArgsConstructor
public class UserStatusRequest {

    @NotNull(message = "Status is required")
    private User.Status status;
}

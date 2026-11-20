package com.library.lms.dto.response;

import com.library.lms.entity.User;
import lombok.Getter;

/** Safe user view for admin endpoints — no password hash. */
@Getter
public class UserResponse {

    private final Long userId;
    private final String username;
    private final String email;
    private final String role;
    private final String status;

    public UserResponse(User user) {
        this.userId = user.getUserId();
        this.username = user.getUsername();
        this.email = user.getEmail();
        this.role = user.getRole().name();
        this.status = user.getStatus().name();
    }
}

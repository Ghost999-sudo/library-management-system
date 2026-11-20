package com.library.lms.dto.response;

import com.library.lms.entity.User;
import lombok.Getter;

/** Safe subset of user data — never includes the password hash. */
@Getter
public class UserInfo {

    private final Long userId;
    private final String username;
    private final String email;
    private final String role;
    private final String status;

    private UserInfo(Long userId, String username, String email, String role, String status) {
        this.userId = userId;
        this.username = username;
        this.email = email;
        this.role = role;
        this.status = status;
    }

    public static UserInfo from(User user) {
        return new UserInfo(user.getUserId(), user.getUsername(), user.getEmail(),
                user.getRole().name(), user.getStatus().name());
    }
}

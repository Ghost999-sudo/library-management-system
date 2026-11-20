package com.library.lms.dto.response;

import lombok.Getter;

/** Response returned by POST /api/v1/auth/login. */
@Getter
public class LoginResponse {

    private final String message;
    private final String accessToken;
    private final String tokenType;
    private final UserInfo user;

    public LoginResponse(String message, String accessToken, UserInfo user) {
        this.message = message;
        this.accessToken = accessToken;
        this.tokenType = "Bearer";
        this.user = user;
    }
}

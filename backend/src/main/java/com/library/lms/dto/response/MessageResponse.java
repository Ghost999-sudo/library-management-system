package com.library.lms.dto.response;

import lombok.Getter;

/** Small helper for endpoints that only need to return a message. */
@Getter
public class MessageResponse {

    private final String message;

    public MessageResponse(String message) {
        this.message = message;
    }
}

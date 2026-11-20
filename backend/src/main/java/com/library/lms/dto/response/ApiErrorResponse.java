package com.library.lms.dto.response;

import com.fasterxml.jackson.annotation.JsonInclude;
import lombok.Getter;

import java.time.LocalDateTime;
import java.util.Map;

/**
 * Consistent error body returned by every API error response.
 * Shape follows section 17 of the REST API documentation.
 */
@Getter
@JsonInclude(JsonInclude.Include.NON_EMPTY)
public class ApiErrorResponse {

    private final LocalDateTime timestamp;
    private final int status;
    private final String error;
    private final String message;
    private final String path;
    private final Map<String, String> fieldErrors;

    private ApiErrorResponse(LocalDateTime timestamp, int status, String error,
                             String message, String path, Map<String, String> fieldErrors) {
        this.timestamp = timestamp;
        this.status = status;
        this.error = error;
        this.message = message;
        this.path = path;
        this.fieldErrors = fieldErrors;
    }

    public static ApiErrorResponse of(LocalDateTime timestamp, int status, String error,
                                      String message, String path) {
        return new ApiErrorResponse(timestamp, status, error, message, path, null);
    }

    public static ApiErrorResponse withFieldErrors(LocalDateTime timestamp, int status, String error,
                                                   String message, String path,
                                                   Map<String, String> fieldErrors) {
        return new ApiErrorResponse(timestamp, status, error, message, path, fieldErrors);
    }
}

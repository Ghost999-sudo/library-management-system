package com.library.lms.exception;

/** Signals a semantically invalid request (for example a reversed date range) — HTTP 400. */
public class InvalidRequestException extends RuntimeException {

    public InvalidRequestException(String message) {
        super(message);
    }
}

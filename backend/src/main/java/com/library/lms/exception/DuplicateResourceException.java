package com.library.lms.exception;

/** Thrown when a unique constraint or duplicate record is detected. Mapped to HTTP 409. */
public class DuplicateResourceException extends RuntimeException {

    public DuplicateResourceException(String message) {
        super(message);
    }
}

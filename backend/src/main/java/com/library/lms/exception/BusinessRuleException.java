package com.library.lms.exception;

/** Thrown when a documented library business rule would be violated. Mapped to HTTP 409. */
public class BusinessRuleException extends RuntimeException {

    public BusinessRuleException(String message) {
        super(message);
    }
}

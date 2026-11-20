package com.library.lms.dto.request;

import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

/** Payload for POST /api/v1/borrow-requests. Members request a title, never a copy. */
@Getter
@Setter
@NoArgsConstructor
public class CreateBorrowRequestRequest {

    @NotNull(message = "Book is required")
    private Long bookId;
}

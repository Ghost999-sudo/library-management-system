package com.library.lms.dto.request;

import com.library.lms.entity.BookCopy;
import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

/** Payload for PATCH /api/v1/book-copies/{copyId}/status. */
@Getter
@Setter
@NoArgsConstructor
public class CopyStatusRequest {

    @NotNull(message = "Status is required")
    private BookCopy.Status status;
}

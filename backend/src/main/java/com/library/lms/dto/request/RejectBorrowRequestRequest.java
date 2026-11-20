package com.library.lms.dto.request;

import jakarta.validation.constraints.Size;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

/** Optional reason shown to the member when a librarian rejects a request. */
@Getter
@Setter
@NoArgsConstructor
public class RejectBorrowRequestRequest {

    @Size(max = 500)
    private String note;
}

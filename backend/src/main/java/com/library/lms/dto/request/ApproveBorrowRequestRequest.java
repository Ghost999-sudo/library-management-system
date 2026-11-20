package com.library.lms.dto.request;

import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

/** Staff picks the physical copy that will be issued when approving a request. */
@Getter
@Setter
@NoArgsConstructor
public class ApproveBorrowRequestRequest {

    @NotNull(message = "Copy is required")
    private Long copyId;
}

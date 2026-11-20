package com.library.lms.dto.request;

import jakarta.validation.constraints.FutureOrPresent;
import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDate;

/** Staff picks the physical copy and return date when approving a request. */
@Getter
@Setter
@NoArgsConstructor
public class ApproveBorrowRequestRequest {

    @NotNull(message = "Copy is required")
    private Long copyId;

    /** Chosen by the librarian; this becomes the loan's due date and drives late fines. */
    @NotNull(message = "Return date is required")
    @FutureOrPresent(message = "Return date must be today or later")
    private LocalDate dueDate;
}

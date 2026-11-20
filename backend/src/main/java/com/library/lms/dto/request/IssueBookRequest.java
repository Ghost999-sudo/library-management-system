package com.library.lms.dto.request;

import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

/**
 * Payload for POST /api/v1/loans. The client supplies only the member and copy.
 * issuedBy, issueDate and dueDate are always calculated by the backend.
 */
@Getter
@Setter
@NoArgsConstructor
public class IssueBookRequest {

    @NotNull(message = "Member is required")
    private Long memberId;

    @NotNull(message = "Copy is required")
    private Long copyId;
}

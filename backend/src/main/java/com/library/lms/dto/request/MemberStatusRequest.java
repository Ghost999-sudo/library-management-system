package com.library.lms.dto.request;

import com.library.lms.entity.Member;
import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

/** Payload for PATCH /api/v1/members/{memberId}/status. */
@Getter
@Setter
@NoArgsConstructor
public class MemberStatusRequest {

    @NotNull(message = "Status is required")
    private Member.Status status;
}

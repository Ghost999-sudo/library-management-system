package com.library.lms.controller;

import com.library.lms.dto.request.CreateMemberRequest;
import com.library.lms.dto.request.MemberStatusRequest;
import com.library.lms.dto.request.UpdateMemberRequest;
import com.library.lms.dto.response.MemberResponse;
import com.library.lms.dto.response.PagedResponse;
import com.library.lms.security.CustomUserPrincipal;
import com.library.lms.service.MemberService;
import jakarta.validation.Valid;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

/** Member management (section 7). Staff manage collections; members only see their own profile. */
@RestController
@RequestMapping("/api/v1/members")
@PreAuthorize("hasAnyRole('ADMIN','LIBRARIAN')")
public class MemberController {

    private final MemberService memberService;

    public MemberController(MemberService memberService) {
        this.memberService = memberService;
    }

    @PostMapping
    public ResponseEntity<MemberResponse> register(@Valid @RequestBody CreateMemberRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(memberService.register(request));
    }

    @GetMapping
    public ResponseEntity<PagedResponse<MemberResponse>> getAll(Pageable pageable) {
        return ResponseEntity.ok(memberService.getAll(pageable));
    }

    @GetMapping("/{memberId}")
    public ResponseEntity<MemberResponse> getById(@PathVariable Long memberId) {
        return ResponseEntity.ok(memberService.getById(memberId));
    }

    /** Method-level rule replaces the staff-only class rule, so this is MEMBER-only. */
    @GetMapping("/me")
    @PreAuthorize("hasRole('MEMBER')")
    public ResponseEntity<MemberResponse> me(@AuthenticationPrincipal CustomUserPrincipal principal) {
        return ResponseEntity.ok(memberService.getMyProfile(principal.getUserId()));
    }

    @PutMapping("/{memberId}")
    public ResponseEntity<MemberResponse> update(@PathVariable Long memberId,
                                                 @Valid @RequestBody UpdateMemberRequest request) {
        return ResponseEntity.ok(memberService.update(memberId, request));
    }

    @PatchMapping("/{memberId}/status")
    public ResponseEntity<MemberResponse> changeStatus(@PathVariable Long memberId,
                                                       @Valid @RequestBody MemberStatusRequest request) {
        return ResponseEntity.ok(memberService.changeStatus(memberId, request.getStatus()));
    }
}

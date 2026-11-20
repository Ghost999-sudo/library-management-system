package com.library.lms.controller;

import com.library.lms.dto.request.ApproveBorrowRequestRequest;
import com.library.lms.dto.request.CreateBorrowRequestRequest;
import com.library.lms.dto.request.RejectBorrowRequestRequest;
import com.library.lms.dto.response.BorrowRequestResponse;
import com.library.lms.dto.response.LoanResponse;
import com.library.lms.dto.response.PagedResponse;
import com.library.lms.entity.BorrowRequest;
import com.library.lms.security.CustomUserPrincipal;
import com.library.lms.service.BorrowRequestService;
import jakarta.validation.Valid;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

/**
 * Borrow requests: members ask for a title; staff decide and pick the copy.
 * Members can only see their own requests; the member id always comes from the token.
 */
@RestController
@RequestMapping("/api/v1/borrow-requests")
@PreAuthorize("hasAnyRole('ADMIN','LIBRARIAN','MEMBER')")
public class BorrowRequestController {

    private final BorrowRequestService borrowRequestService;

    public BorrowRequestController(BorrowRequestService borrowRequestService) {
        this.borrowRequestService = borrowRequestService;
    }

    @PostMapping
    @PreAuthorize("hasRole('MEMBER')")
    public ResponseEntity<BorrowRequestResponse> request(
            @Valid @RequestBody CreateBorrowRequestRequest request,
            @AuthenticationPrincipal CustomUserPrincipal principal) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(borrowRequestService.request(principal.getUserId(), request));
    }

    /** Declared before the id-based routes so "me" is never parsed as a number. */
    @GetMapping("/me")
    @PreAuthorize("hasRole('MEMBER')")
    public ResponseEntity<PagedResponse<BorrowRequestResponse>> getMyRequests(
            @AuthenticationPrincipal CustomUserPrincipal principal, Pageable pageable) {
        return ResponseEntity.ok(borrowRequestService.getMyRequests(principal.getUserId(), pageable));
    }

    @GetMapping
    @PreAuthorize("hasAnyRole('ADMIN','LIBRARIAN')")
    public ResponseEntity<PagedResponse<BorrowRequestResponse>> getAll(
            @RequestParam(required = false) BorrowRequest.Status status, Pageable pageable) {
        return ResponseEntity.ok(borrowRequestService.getAll(status, pageable));
    }

    @PostMapping("/{requestId}/approve")
    @PreAuthorize("hasAnyRole('ADMIN','LIBRARIAN')")
    public ResponseEntity<LoanResponse> approve(
            @PathVariable Long requestId,
            @Valid @RequestBody ApproveBorrowRequestRequest request,
            @AuthenticationPrincipal CustomUserPrincipal principal) {
        return ResponseEntity.ok(borrowRequestService.approve(
                requestId, request, principal.getUserId()));
    }

    @PostMapping("/{requestId}/reject")
    @PreAuthorize("hasAnyRole('ADMIN','LIBRARIAN')")
    public ResponseEntity<BorrowRequestResponse> reject(
            @PathVariable Long requestId,
            @Valid @RequestBody RejectBorrowRequestRequest request,
            @AuthenticationPrincipal CustomUserPrincipal principal) {
        return ResponseEntity.ok(borrowRequestService.reject(
                requestId, request, principal.getUserId()));
    }
}

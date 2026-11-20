package com.library.lms.controller;

import com.library.lms.dto.request.IssueBookRequest;
import com.library.lms.dto.response.LoanResponse;
import com.library.lms.dto.response.PagedResponse;
import com.library.lms.dto.response.ReturnResponse;
import com.library.lms.security.CustomUserPrincipal;
import com.library.lms.service.LoanService;
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
import org.springframework.web.bind.annotation.RestController;

/** Loan management (section 12). Staff issue/return; members read only their own loans. */
@RestController
@RequestMapping("/api/v1/loans")
@PreAuthorize("hasAnyRole('ADMIN','LIBRARIAN')")
public class LoanController {

    private final LoanService loanService;

    public LoanController(LoanService loanService) {
        this.loanService = loanService;
    }

    @PostMapping
    public ResponseEntity<LoanResponse> issue(@Valid @RequestBody IssueBookRequest request,
                                              @AuthenticationPrincipal CustomUserPrincipal principal) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(loanService.issue(request, principal.getUserId()));
    }

    @GetMapping
    public ResponseEntity<PagedResponse<LoanResponse>> getAll(Pageable pageable) {
        return ResponseEntity.ok(loanService.getAll(pageable));
    }

    /** Literal routes are declared before /{loanId} for clarity. */
    @GetMapping("/overdue")
    public ResponseEntity<PagedResponse<LoanResponse>> getOverdue(Pageable pageable) {
        return ResponseEntity.ok(loanService.getOverdue(pageable));
    }

    @GetMapping("/me")
    @PreAuthorize("hasRole('MEMBER')")
    public ResponseEntity<PagedResponse<LoanResponse>> getMyLoans(
            @AuthenticationPrincipal CustomUserPrincipal principal, Pageable pageable) {
        return ResponseEntity.ok(loanService.getMyLoans(principal.getUserId(), pageable));
    }

    @GetMapping("/{loanId}")
    public ResponseEntity<LoanResponse> getById(@PathVariable Long loanId) {
        return ResponseEntity.ok(loanService.getById(loanId));
    }

    @PostMapping("/{loanId}/return")
    public ResponseEntity<ReturnResponse> returnBook(@PathVariable Long loanId) {
        return ResponseEntity.ok(loanService.returnBook(loanId));
    }
}

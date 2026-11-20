package com.library.lms.controller;

import com.library.lms.dto.request.FinePaymentRequest;
import com.library.lms.dto.response.FinePaymentResponse;
import com.library.lms.dto.response.FineResponse;
import com.library.lms.dto.response.PagedResponse;
import com.library.lms.security.CustomUserPrincipal;
import com.library.lms.service.FineService;
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

import java.util.List;

/** Fine management (section 13). Staff collect payments; members read only their own fines. */
@RestController
@RequestMapping("/api/v1/fines")
@PreAuthorize("hasAnyRole('ADMIN','LIBRARIAN')")
public class FineController {

    private final FineService fineService;

    public FineController(FineService fineService) {
        this.fineService = fineService;
    }

    @GetMapping
    public ResponseEntity<PagedResponse<FineResponse>> getAll(Pageable pageable) {
        return ResponseEntity.ok(fineService.getAll(pageable));
    }

    @GetMapping("/me")
    @PreAuthorize("hasRole('MEMBER')")
    public ResponseEntity<PagedResponse<FineResponse>> getMyFines(
            @AuthenticationPrincipal CustomUserPrincipal principal, Pageable pageable) {
        return ResponseEntity.ok(fineService.getMyFines(principal.getUserId(), pageable));
    }

    @GetMapping("/{fineId}")
    public ResponseEntity<FineResponse> getById(@PathVariable Long fineId) {
        return ResponseEntity.ok(fineService.getById(fineId));
    }

    @PostMapping("/{fineId}/payments")
    public ResponseEntity<FinePaymentResponse> recordPayment(
            @PathVariable Long fineId,
            @Valid @RequestBody FinePaymentRequest request,
            @AuthenticationPrincipal CustomUserPrincipal principal) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(fineService.recordPayment(fineId, request, principal.getUserId()));
    }

    @GetMapping("/{fineId}/payments")
    public ResponseEntity<List<FinePaymentResponse>> getPayments(@PathVariable Long fineId) {
        return ResponseEntity.ok(fineService.getPayments(fineId));
    }
}

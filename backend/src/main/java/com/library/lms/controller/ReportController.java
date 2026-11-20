package com.library.lms.controller;

import com.library.lms.dto.response.FineReportResponse;
import com.library.lms.dto.response.LoanReportResponse;
import com.library.lms.service.ReportService;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.time.LocalDate;

/** Loan and fine date-range reports (sections 15.2–15.3), staff only. */
@RestController
@RequestMapping("/api/v1/reports")
@PreAuthorize("hasAnyRole('ADMIN','LIBRARIAN')")
public class ReportController {

    private final ReportService reportService;

    public ReportController(ReportService reportService) {
        this.reportService = reportService;
    }

    @GetMapping("/loans")
    public LoanReportResponse loans(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate) {
        return reportService.loanReport(startDate, endDate);
    }

    @GetMapping("/fines")
    public FineReportResponse fines(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate) {
        return reportService.fineReport(startDate, endDate);
    }
}

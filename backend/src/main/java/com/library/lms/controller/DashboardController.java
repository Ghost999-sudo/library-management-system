package com.library.lms.controller;

import com.library.lms.dto.response.DashboardSummaryResponse;
import com.library.lms.service.DashboardService;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

/** Dashboard summary (section 15.1), staff only. */
@RestController
@RequestMapping("/api/v1/dashboard")
@PreAuthorize("hasAnyRole('ADMIN','LIBRARIAN')")
public class DashboardController {

    private final DashboardService dashboardService;

    public DashboardController(DashboardService dashboardService) {
        this.dashboardService = dashboardService;
    }

    @GetMapping("/summary")
    public DashboardSummaryResponse summary() {
        return dashboardService.getSummary();
    }
}

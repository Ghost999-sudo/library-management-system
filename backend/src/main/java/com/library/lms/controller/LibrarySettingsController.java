package com.library.lms.controller;

import com.library.lms.dto.request.LibrarySettingsRequest;
import com.library.lms.dto.response.LibrarySettingsResponse;
import com.library.lms.service.LibrarySettingsService;
import jakarta.validation.Valid;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

/** Library settings (section 14): staff read, admin writes. */
@RestController
@RequestMapping("/api/v1/settings")
@PreAuthorize("hasAnyRole('ADMIN','LIBRARIAN')")
public class LibrarySettingsController {

    private final LibrarySettingsService settingsService;

    public LibrarySettingsController(LibrarySettingsService settingsService) {
        this.settingsService = settingsService;
    }

    @GetMapping
    public LibrarySettingsResponse get() {
        return settingsService.get();
    }

    @PutMapping
    @PreAuthorize("hasRole('ADMIN')")
    public LibrarySettingsResponse update(@Valid @RequestBody LibrarySettingsRequest request) {
        return settingsService.update(request);
    }
}

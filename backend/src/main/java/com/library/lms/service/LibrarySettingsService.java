package com.library.lms.service;

import com.library.lms.dto.request.LibrarySettingsRequest;
import com.library.lms.dto.response.LibrarySettingsResponse;
import com.library.lms.entity.LibrarySettings;
import com.library.lms.exception.ResourceNotFoundException;
import com.library.lms.repository.LibrarySettingsRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

/**
 * Library settings (section 14). The table has no single-row database constraint,
 * so the application always reads and writes the lowest setting_id record only.
 */
@Service
@Transactional(readOnly = true)
public class LibrarySettingsService {

    private final LibrarySettingsRepository settingsRepository;

    public LibrarySettingsService(LibrarySettingsRepository settingsRepository) {
        this.settingsRepository = settingsRepository;
    }

    public LibrarySettingsResponse get() {
        return new LibrarySettingsResponse(findSettings());
    }

    @Transactional
    public LibrarySettingsResponse update(LibrarySettingsRequest request) {
        LibrarySettings settings = findSettings();
        settings.setBorrowingLimit(request.getBorrowingLimit());
        settings.setBorrowingPeriodDays(request.getBorrowingPeriodDays());
        settings.setFinePerDay(request.getFinePerDay());
        settings.setFineGracePeriodDays(request.getFineGracePeriodDays());
        settings.setMaxOutstandingFine(request.getMaxOutstandingFine());
        return new LibrarySettingsResponse(settingsRepository.save(settings));
    }

    private LibrarySettings findSettings() {
        return settingsRepository.findFirstByOrderBySettingIdAsc()
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Library settings are not configured"));
    }
}

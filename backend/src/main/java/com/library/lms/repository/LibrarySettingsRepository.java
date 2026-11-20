package com.library.lms.repository;

import com.library.lms.entity.LibrarySettings;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface LibrarySettingsRepository extends JpaRepository<LibrarySettings, Long> {

    /** The database does not enforce one row; the backend always uses the lowest setting_id. */
    Optional<LibrarySettings> findFirstByOrderBySettingIdAsc();

    List<LibrarySettings> findAllByOrderBySettingIdAsc();
}

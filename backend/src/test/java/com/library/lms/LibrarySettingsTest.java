package com.library.lms;

import com.library.lms.entity.LibrarySettings;
import com.library.lms.entity.User;
import com.library.lms.repository.LibrarySettingsRepository;
import com.library.lms.repository.UserRepository;
import com.library.lms.security.JwtTokenService;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;

import java.math.BigDecimal;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

/** HTTP-level checks for Phase 7 library settings. */
@SpringBootTest
@AutoConfigureMockMvc
class LibrarySettingsTest {

    @Autowired
    private MockMvc mockMvc;
    @Autowired
    private JwtTokenService tokenService;
    @Autowired
    private PasswordEncoder passwordEncoder;

    @MockitoBean
    private UserRepository userRepository;
    @MockitoBean
    private LibrarySettingsRepository settingsRepository;

    @Test
    void librarianCanReadSettingsButCannotUpdate() throws Exception {
        when(settingsRepository.findFirstByOrderBySettingIdAsc())
                .thenReturn(Optional.of(settings()));

        mockMvc.perform(get("/api/v1/settings")
                        .header("Authorization", bearer(2L, User.Role.LIBRARIAN)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.borrowingLimit").value(3));

        mockMvc.perform(put("/api/v1/settings")
                        .header("Authorization", bearer(2L, User.Role.LIBRARIAN))
                        .contentType("application/json")
                        .content(validBody()))
                .andExpect(status().isForbidden());
    }

    @Test
    void adminCanUpdateSettings() throws Exception {
        LibrarySettings settings = settings();
        when(settingsRepository.findFirstByOrderBySettingIdAsc())
                .thenReturn(Optional.of(settings));
        when(settingsRepository.save(any(LibrarySettings.class))).thenAnswer(inv -> inv.getArgument(0));

        mockMvc.perform(put("/api/v1/settings")
                        .header("Authorization", bearer(3L, User.Role.ADMIN))
                        .contentType("application/json")
                        .content("""
                                {"borrowingLimit":5,"borrowingPeriodDays":21,
                                 "finePerDay":12.50,"fineGracePeriodDays":2,
                                 "maxOutstandingFine":750.00}
                                """))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.settingId").value(1))
                .andExpect(jsonPath("$.borrowingLimit").value(5))
                .andExpect(jsonPath("$.borrowingPeriodDays").value(21))
                .andExpect(jsonPath("$.finePerDay").value(12.5))
                .andExpect(jsonPath("$.fineGracePeriodDays").value(2))
                .andExpect(jsonPath("$.maxOutstandingFine").value(750.0));

        verify(settingsRepository).save(settings);
        assertEquals(5, settings.getBorrowingLimit());
    }

    @Test
    void settingsValidationRejectsNonPositiveValues() throws Exception {
        mockMvc.perform(put("/api/v1/settings")
                        .header("Authorization", bearer(3L, User.Role.ADMIN))
                        .contentType("application/json")
                        .content("""
                                {"borrowingLimit":0,"borrowingPeriodDays":14,
                                 "finePerDay":10.00,"fineGracePeriodDays":0,
                                 "maxOutstandingFine":500.00}
                                """))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.status").value(400));
    }

    @Test
    void missingSettingsReturnNotFound() throws Exception {
        when(settingsRepository.findFirstByOrderBySettingIdAsc()).thenReturn(Optional.empty());

        mockMvc.perform(get("/api/v1/settings")
                        .header("Authorization", bearer(2L, User.Role.LIBRARIAN)))
                .andExpect(status().isNotFound())
                .andExpect(jsonPath("$.message").value("Library settings are not configured"));
    }

    // ---------- Helpers ----------

    private String validBody() {
        return """
                {"borrowingLimit":3,"borrowingPeriodDays":14,
                 "finePerDay":10.00,"fineGracePeriodDays":0,"maxOutstandingFine":500.00}
                """;
    }

    private String bearer(Long userId, User.Role role) {
        User user = new User();
        user.setUserId(userId);
        user.setUsername("user" + userId);
        user.setEmail("user" + userId + "@example.com");
        user.setPasswordHash(passwordEncoder.encode("password123"));
        user.setRole(role);
        user.setStatus(User.Status.ACTIVE);
        when(userRepository.findById(userId)).thenReturn(Optional.of(user));
        return "Bearer " + tokenService.generateAccessToken(user);
    }

    private LibrarySettings settings() {
        LibrarySettings settings = new LibrarySettings();
        settings.setSettingId(1L);
        settings.setBorrowingLimit(3);
        settings.setBorrowingPeriodDays(14);
        settings.setFinePerDay(new BigDecimal("10.00"));
        settings.setFineGracePeriodDays(0);
        settings.setMaxOutstandingFine(new BigDecimal("500.00"));
        return settings;
    }
}

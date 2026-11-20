package com.library.lms;

import com.library.lms.entity.User;
import com.library.lms.repository.UserRepository;
import com.library.lms.security.JwtTokenService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;

import java.util.Optional;

import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

/**
 * Exercises the full filter -> service -> controller chain with an in-memory user.
 * The repository is mocked so these tests never insert or modify database rows.
 */
@SpringBootTest
@AutoConfigureMockMvc
class AuthenticatedRequestTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Autowired
    private JwtTokenService tokenService;

    @MockitoBean
    private UserRepository userRepository;

    private User member;

    @BeforeEach
    void setUp() {
        member = new User();
        member.setUserId(42L);
        member.setUsername("student001");
        member.setEmail("student@example.com");
        member.setPasswordHash(passwordEncoder.encode("password123"));
        member.setRole(User.Role.MEMBER);
        member.setStatus(User.Status.ACTIVE);

        when(userRepository.findByUsernameOrEmail("student001", "student001"))
                .thenReturn(Optional.of(member));
        when(userRepository.findById(42L)).thenReturn(Optional.of(member));
    }

    @Test
    void loginWithCorrectPasswordReturnsTokenAndSafeUser() throws Exception {
        mockMvc.perform(post("/api/v1/auth/login")
                        .contentType("application/json")
                        .content("{\"username\":\"student001\",\"password\":\"password123\"}"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.message").value("Login successful"))
                .andExpect(jsonPath("$.accessToken").isNotEmpty())
                .andExpect(jsonPath("$.tokenType").value("Bearer"))
                .andExpect(jsonPath("$.user.userId").value(42))
                .andExpect(jsonPath("$.user.role").value("MEMBER"))
                .andExpect(jsonPath("$.user.passwordHash").doesNotExist());
    }

    @Test
    void loginWithWrongPasswordReturns401() throws Exception {
        mockMvc.perform(post("/api/v1/auth/login")
                        .contentType("application/json")
                        .content("{\"username\":\"student001\",\"password\":\"wrong\"}"))
                .andExpect(status().isUnauthorized())
                .andExpect(jsonPath("$.message").value("Invalid username or password"));
    }

    @Test
    void inactiveAccountCannotLogin() throws Exception {
        member.setStatus(User.Status.INACTIVE);

        mockMvc.perform(post("/api/v1/auth/login")
                        .contentType("application/json")
                        .content("{\"username\":\"student001\",\"password\":\"password123\"}"))
                .andExpect(status().isUnauthorized())
                .andExpect(jsonPath("$.message").value("This account is inactive"));
    }

    @Test
    void meWithValidTokenReturnsCurrentUser() throws Exception {
        mockMvc.perform(get("/api/v1/auth/me")
                        .header("Authorization", "Bearer " + tokenFor(member)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.userId").value(42))
                .andExpect(jsonPath("$.username").value("student001"))
                .andExpect(jsonPath("$.email").value("student@example.com"))
                .andExpect(jsonPath("$.role").value("MEMBER"))
                .andExpect(jsonPath("$.status").value("ACTIVE"))
                .andExpect(jsonPath("$.passwordHash").doesNotExist());
    }

    @Test
    void logoutWithValidTokenReturns200() throws Exception {
        mockMvc.perform(post("/api/v1/auth/logout")
                        .header("Authorization", "Bearer " + tokenFor(member)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.message").exists());
    }

    private String tokenFor(User user) {
        return tokenService.generateAccessToken(user);
    }
}

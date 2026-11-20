package com.library.lms;

import com.library.lms.entity.User;
import com.library.lms.repository.UserRepository;
import com.library.lms.security.JwtTokenService;
import com.library.lms.service.BorrowRequestService;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;

import java.util.Optional;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

/** Role enforcement for the borrow-request endpoints; the service is mocked. */
@SpringBootTest
@AutoConfigureMockMvc
class BorrowRequestControllerTest {

    @Autowired
    private MockMvc mockMvc;
    @Autowired
    private JwtTokenService tokenService;
    @Autowired
    private PasswordEncoder passwordEncoder;

    @MockitoBean
    private UserRepository userRepository;
    @MockitoBean
    private BorrowRequestService borrowRequestService;

    @Test
    void memberCanRequestButCannotReview() throws Exception {
        mockMvc.perform(post("/api/v1/borrow-requests")
                        .header("Authorization", bearer(1L, User.Role.MEMBER))
                        .contentType("application/json")
                        .content("{\"bookId\":15}"))
                .andExpect(status().isCreated());

        mockMvc.perform(get("/api/v1/borrow-requests")
                        .header("Authorization", bearer(1L, User.Role.MEMBER)))
                .andExpect(status().isForbidden());

        mockMvc.perform(post("/api/v1/borrow-requests/1/approve")
                        .header("Authorization", bearer(1L, User.Role.MEMBER))
                        .contentType("application/json")
                        .content("{\"copyId\":8}"))
                .andExpect(status().isForbidden());
    }

    @Test
    void librarianCanReviewButCannotRequest() throws Exception {
        mockMvc.perform(post("/api/v1/borrow-requests")
                        .header("Authorization", bearer(2L, User.Role.LIBRARIAN))
                        .contentType("application/json")
                        .content("{\"bookId\":15}"))
                .andExpect(status().isForbidden());

        when(borrowRequestService.getAll(any(), any()))
                .thenReturn(null);

        mockMvc.perform(get("/api/v1/borrow-requests?status=PENDING")
                        .header("Authorization", bearer(2L, User.Role.LIBRARIAN)))
                .andExpect(status().isOk());

        mockMvc.perform(post("/api/v1/borrow-requests/1/approve")
                        .header("Authorization", bearer(2L, User.Role.LIBRARIAN))
                        .contentType("application/json")
                        .content("{\"copyId\":8}"))
                .andExpect(status().isOk());

        mockMvc.perform(post("/api/v1/borrow-requests/1/reject")
                        .header("Authorization", bearer(2L, User.Role.LIBRARIAN))
                        .contentType("application/json")
                        .content("{\"note\":\"No copies available\"}"))
                .andExpect(status().isOk());
    }

    @Test
    void memberCanReadOnlyOwnRequestList() throws Exception {
        when(borrowRequestService.getMyRequests(any(), any()))
                .thenReturn(null);

        mockMvc.perform(get("/api/v1/borrow-requests/me")
                        .header("Authorization", bearer(3L, User.Role.MEMBER)))
                .andExpect(status().isOk());
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
}

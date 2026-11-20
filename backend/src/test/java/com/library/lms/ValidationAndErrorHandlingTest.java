package com.library.lms;

import com.library.lms.entity.User;
import com.library.lms.repository.BookRepository;
import com.library.lms.repository.CategoryRepository;
import com.library.lms.repository.UserRepository;
import com.library.lms.security.JwtTokenService;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;
import org.springframework.http.MediaType;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;

import java.util.Optional;

import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.delete;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

/**
 * Phase 11: every error path must produce the documented response shape, and no
 * framework exception may fall through as an unstructured 500.
 */
@SpringBootTest
@AutoConfigureMockMvc
class ValidationAndErrorHandlingTest {

    @Autowired
    private MockMvc mockMvc;
    @Autowired
    private JwtTokenService tokenService;
    @Autowired
    private PasswordEncoder passwordEncoder;

    @MockitoBean
    private UserRepository userRepository;
    @MockitoBean
    private CategoryRepository categoryRepository;
    @MockitoBean
    private BookRepository bookRepository;

    @Test
    void validationErrorHasDocumentedShape() throws Exception {
        mockMvc.perform(post("/api/v1/categories")
                        .header("Authorization", staffToken())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{}"))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.timestamp").exists())
                .andExpect(jsonPath("$.status").value(400))
                .andExpect(jsonPath("$.error").value("Bad Request"))
                .andExpect(jsonPath("$.message").value("Validation failed"))
                .andExpect(jsonPath("$.path").value("/api/v1/categories"))
                .andExpect(jsonPath("$.fieldErrors.categoryName").exists());
    }

    @Test
    void malformedJsonReturns400() throws Exception {
        mockMvc.perform(post("/api/v1/categories")
                        .header("Authorization", staffToken())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{"))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.status").value(400))
                .andExpect(jsonPath("$.message").value("Malformed or invalid request"));
    }

    @Test
    void invalidPathVariableReturns400() throws Exception {
        mockMvc.perform(get("/api/v1/books/not-a-number")
                        .header("Authorization", staffToken()))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.status").value(400));
    }

    @Test
    void missingResourceReturns404() throws Exception {
        when(bookRepository.findByIdWithDetails(999L)).thenReturn(Optional.empty());

        mockMvc.perform(get("/api/v1/books/999")
                        .header("Authorization", staffToken()))
                .andExpect(status().isNotFound())
                .andExpect(jsonPath("$.status").value(404))
                .andExpect(jsonPath("$.error").value("Not Found"))
                .andExpect(jsonPath("$.message").value("Book not found: 999"));
    }

    @Test
    void unknownPathReturns404RatherThan500() throws Exception {
        mockMvc.perform(get("/api/v1/does-not-exist")
                        .header("Authorization", staffToken()))
                .andExpect(status().isNotFound())
                .andExpect(jsonPath("$.status").value(404))
                .andExpect(jsonPath("$.message").value("Resource not found"));
    }

    @Test
    void wrongHttpMethodReturns405RatherThan500() throws Exception {
        mockMvc.perform(post("/api/v1/dashboard/summary")
                        .header("Authorization", staffToken()))
                .andExpect(status().isMethodNotAllowed())
                .andExpect(jsonPath("$.status").value(405))
                .andExpect(jsonPath("$.message").value("Method not allowed"));
    }

    @Test
    void unsupportedContentTypeReturns415() throws Exception {
        mockMvc.perform(post("/api/v1/categories")
                        .header("Authorization", staffToken())
                        .contentType(MediaType.TEXT_PLAIN)
                        .content("ICT"))
                .andExpect(status().isUnsupportedMediaType())
                .andExpect(jsonPath("$.status").value(415));
    }

    @Test
    void duplicateResourceReturns409() throws Exception {
        when(categoryRepository.existsByCategoryName("ICT")).thenReturn(true);

        mockMvc.perform(post("/api/v1/categories")
                        .header("Authorization", staffToken())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"categoryName\":\"ICT\"}"))
                .andExpect(status().isConflict())
                .andExpect(jsonPath("$.status").value(409))
                .andExpect(jsonPath("$.error").value("Conflict"));
    }

    @Test
    void unauthenticatedAndForbiddenReturnsHaveSameShape() throws Exception {
        mockMvc.perform(get("/api/v1/books"))
                .andExpect(status().isUnauthorized())
                .andExpect(jsonPath("$.status").value(401))
                .andExpect(jsonPath("$.error").value("Unauthorized"))
                .andExpect(jsonPath("$.path").value("/api/v1/books"));

        mockMvc.perform(post("/api/v1/categories")
                        .header("Authorization", bearer(1L, User.Role.MEMBER))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"categoryName\":\"ICT\"}"))
                .andExpect(status().isForbidden())
                .andExpect(jsonPath("$.status").value(403))
                .andExpect(jsonPath("$.error").value("Forbidden"))
                .andExpect(jsonPath("$.path").value("/api/v1/categories"));
    }

    // ---------- Helpers ----------

    private String staffToken() {
        return bearer(2L, User.Role.LIBRARIAN);
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

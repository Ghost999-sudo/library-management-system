package com.library.lms;

import com.library.lms.entity.Member;
import com.library.lms.entity.User;
import com.library.lms.repository.MemberRepository;
import com.library.lms.repository.UserRepository;
import com.library.lms.security.JwtTokenService;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;

import java.time.LocalDate;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotEquals;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.patch;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

/**
 * HTTP-level checks for Phase 5. Repositories are mocked so no database records are
 * inserted; the Spring context, security chain and controllers are all real.
 */
@SpringBootTest
@AutoConfigureMockMvc
class MemberManagementTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private JwtTokenService tokenService;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @MockitoBean
    private UserRepository userRepository;

    @MockitoBean
    private MemberRepository memberRepository;

    // ---------- Role enforcement ----------

    @Test
    void memberCannotListUsers() throws Exception {
        mockMvc.perform(get("/api/v1/users").header("Authorization", bearer(1L, User.Role.MEMBER)))
                .andExpect(status().isForbidden());
    }

    @Test
    void librarianCannotListUsers() throws Exception {
        mockMvc.perform(get("/api/v1/users").header("Authorization", bearer(2L, User.Role.LIBRARIAN)))
                .andExpect(status().isForbidden());
    }

    @Test
    void adminCanListUsersWithDocumentedPageShape() throws Exception {
        when(userRepository.findAll(any(Pageable.class)))
                .thenReturn(new PageImpl<>(java.util.List.of(), PageRequest.of(0, 10), 0));

        mockMvc.perform(get("/api/v1/users?page=0&size=10")
                        .header("Authorization", bearer(3L, User.Role.ADMIN)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.content").isArray())
                .andExpect(jsonPath("$.page").value(0))
                .andExpect(jsonPath("$.size").value(10))
                .andExpect(jsonPath("$.totalElements").value(0))
                .andExpect(jsonPath("$.totalPages").value(0));
    }

    @Test
    void memberCannotListMembers() throws Exception {
        mockMvc.perform(get("/api/v1/members").header("Authorization", bearer(1L, User.Role.MEMBER)))
                .andExpect(status().isForbidden());
    }

    @Test
    void librarianCanListMembers() throws Exception {
        when(memberRepository.findAllWithUser(any(Pageable.class)))
                .thenReturn(Page.<Member>empty());

        mockMvc.perform(get("/api/v1/members").header("Authorization", bearer(2L, User.Role.LIBRARIAN)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.content").isArray());
    }

    @Test
    void staffCannotUseMemberMeEndpoint() throws Exception {
        mockMvc.perform(get("/api/v1/members/me").header("Authorization", bearer(2L, User.Role.LIBRARIAN)))
                .andExpect(status().isForbidden());
    }

    // ---------- Member profile and registration ----------

    @Test
    void memberCanReadOwnProfile() throws Exception {
        User user = user(42L, "student001", User.Role.MEMBER);
        when(userRepository.findById(42L)).thenReturn(Optional.of(user));
        when(memberRepository.findByUserUserId(42L)).thenReturn(Optional.of(member(7L, user)));

        mockMvc.perform(get("/api/v1/members/me").header("Authorization", bearer(42L, User.Role.MEMBER)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.memberId").value(7))
                .andExpect(jsonPath("$.userId").value(42))
                .andExpect(jsonPath("$.username").value("student001"))
                .andExpect(jsonPath("$.membershipNumber").value("MEM001"))
                .andExpect(jsonPath("$.status").value("ACTIVE"))
                .andExpect(jsonPath("$.passwordHash").doesNotExist());
    }

    @Test
    void registerMemberCreatesUserAndMemberInOneCall() throws Exception {
        when(userRepository.save(any(User.class))).thenAnswer(inv -> {
            User saved = inv.getArgument(0);
            saved.setUserId(50L);
            return saved;
        });
        when(memberRepository.save(any(Member.class))).thenAnswer(inv -> {
            Member saved = inv.getArgument(0);
            saved.setMemberId(100L);
            return saved;
        });

        mockMvc.perform(post("/api/v1/members")
                        .header("Authorization", bearer(3L, User.Role.ADMIN))
                        .contentType("application/json")
                        .content("""
                                {"username":"newstudent","email":"new@example.com",
                                 "password":"temporary-password","membershipNumber":"MEM002",
                                 "firstName":"Jane","lastName":"Doe","admissionNumber":"ADM002",
                                 "phone":"0712345678","department":"IT",
                                 "registrationDate":"2026-11-20"}
                                """))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.memberId").value(100))
                .andExpect(jsonPath("$.userId").value(50))
                .andExpect(jsonPath("$.firstName").value("Jane"))
                .andExpect(jsonPath("$.role").doesNotExist());

        var userCaptor = org.mockito.ArgumentCaptor.forClass(User.class);
        verify(userRepository).save(userCaptor.capture());
        User savedUser = userCaptor.getValue();
        assertEquals(User.Role.MEMBER, savedUser.getRole());
        assertNotEquals("temporary-password", savedUser.getPasswordHash());
        assertTrue(passwordEncoder.matches("temporary-password", savedUser.getPasswordHash()));
    }

    @Test
    void registerMemberRejectsDuplicateUsername() throws Exception {
        when(userRepository.existsByUsername("student001")).thenReturn(true);

        mockMvc.perform(post("/api/v1/members")
                        .header("Authorization", bearer(3L, User.Role.ADMIN))
                        .contentType("application/json")
                        .content("""
                                {"username":"student001","email":"new@example.com",
                                 "password":"temporary-password","membershipNumber":"MEM002",
                                 "firstName":"Jane","lastName":"Doe","admissionNumber":"ADM002",
                                 "registrationDate":"2026-11-20"}
                                """))
                .andExpect(status().isConflict())
                .andExpect(jsonPath("$.status").value(409));
    }

    @Test
    void registerMemberRejectsInvalidPayload() throws Exception {
        mockMvc.perform(post("/api/v1/members")
                        .header("Authorization", bearer(3L, User.Role.ADMIN))
                        .contentType("application/json")
                        .content("{\"username\":\"x\"}"))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.status").value(400));
    }

    // ---------- Updates ----------

    @Test
    void librarianCanChangeMemberStatus() throws Exception {
        User user = user(42L, "student001", User.Role.MEMBER);
        Member member = member(7L, user);
        when(memberRepository.findById(7L)).thenReturn(Optional.of(member));
        when(memberRepository.save(any(Member.class))).thenAnswer(inv -> inv.getArgument(0));

        mockMvc.perform(patch("/api/v1/members/7/status")
                        .header("Authorization", bearer(2L, User.Role.LIBRARIAN))
                        .contentType("application/json")
                        .content("{\"status\":\"INACTIVE\"}"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status").value("INACTIVE"));

        assertEquals(Member.Status.INACTIVE, member.getStatus());
    }

    @Test
    void adminCanChangeUserStatus() throws Exception {
        User user = user(5L, "librarian01", User.Role.LIBRARIAN);
        when(userRepository.findById(5L)).thenReturn(Optional.of(user));
        when(userRepository.save(any(User.class))).thenAnswer(inv -> inv.getArgument(0));

        mockMvc.perform(patch("/api/v1/users/5/status")
                        .header("Authorization", bearer(3L, User.Role.ADMIN))
                        .contentType("application/json")
                        .content("{\"status\":\"INACTIVE\"}"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status").value("INACTIVE"));

        assertEquals(User.Status.INACTIVE, user.getStatus());
    }

    // ---------- Helpers ----------

    /** Creates a signed token and teaches the mocked repository how to load its principal. */
    private String bearer(Long userId, User.Role role) {
        User user = user(userId, "user" + userId, role);
        when(userRepository.findById(userId)).thenReturn(Optional.of(user));
        return "Bearer " + tokenService.generateAccessToken(user);
    }

    private User user(Long id, String username, User.Role role) {
        User user = new User();
        user.setUserId(id);
        user.setUsername(username);
        user.setEmail(username + "@example.com");
        user.setPasswordHash(passwordEncoder.encode("password123"));
        user.setRole(role);
        user.setStatus(User.Status.ACTIVE);
        return user;
    }

    private Member member(Long id, User user) {
        Member member = new Member();
        member.setMemberId(id);
        member.setUser(user);
        member.setMembershipNumber("MEM001");
        member.setFirstName("John");
        member.setLastName("Doe");
        member.setAdmissionNumber("ADM001");
        member.setRegistrationDate(LocalDate.of(2026, 11, 20));
        member.setStatus(Member.Status.ACTIVE);
        return member;
    }
}

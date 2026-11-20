package com.library.lms.controller;

import com.library.lms.dto.request.LoginRequest;
import com.library.lms.dto.response.LoginResponse;
import com.library.lms.dto.response.MessageResponse;
import com.library.lms.dto.response.UserInfo;
import com.library.lms.security.CustomUserPrincipal;
import com.library.lms.service.AuthService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/auth")
public class AuthController {

    private final AuthService authService;

    public AuthController(AuthService authService) {
        this.authService = authService;
    }

    /** POST /api/v1/auth/login — public endpoint. */
    @PostMapping("/login")
    public ResponseEntity<LoginResponse> login(@Valid @RequestBody LoginRequest request) {
        return ResponseEntity.ok(authService.login(request));
    }

    /** GET /api/v1/auth/me — any authenticated role. */
    @GetMapping("/me")
    public ResponseEntity<UserInfo> me(@AuthenticationPrincipal CustomUserPrincipal principal) {
        return ResponseEntity.ok(authService.currentUser(principal.getUserId()));
    }

    /** POST /api/v1/auth/logout — stateless JWT: the client discards its token. */
    @PostMapping("/logout")
    public ResponseEntity<MessageResponse> logout() {
        return ResponseEntity.ok(new MessageResponse(
                "Logged out. Please discard your access token on the client."));
    }
}

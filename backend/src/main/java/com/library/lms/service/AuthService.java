package com.library.lms.service;

import com.library.lms.dto.request.LoginRequest;
import com.library.lms.dto.response.LoginResponse;
import com.library.lms.dto.response.UserInfo;
import com.library.lms.entity.User;
import com.library.lms.exception.ResourceNotFoundException;
import com.library.lms.repository.UserRepository;
import com.library.lms.security.JwtTokenService;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.DisabledException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class AuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtTokenService tokenService;

    public AuthService(UserRepository userRepository,
                       PasswordEncoder passwordEncoder,
                       JwtTokenService tokenService) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.tokenService = tokenService;
    }

    /** Verifies credentials and issues a signed access token. */
    @Transactional(readOnly = true)
    public LoginResponse login(LoginRequest request) {
        User user = userRepository.findByUsernameOrEmail(
                        request.getUsername().trim(), request.getUsername().trim())
                .orElseThrow(() -> new BadCredentialsException("Invalid username or password"));

        if (!passwordEncoder.matches(request.getPassword(), user.getPasswordHash())) {
            // Deliberately identical message for unknown user and wrong password.
            throw new BadCredentialsException("Invalid username or password");
        }
        if (user.getStatus() != User.Status.ACTIVE) {
            throw new DisabledException("This account is inactive");
        }

        String token = tokenService.generateAccessToken(user);
        return new LoginResponse("Login successful", token, UserInfo.from(user));
    }

    /** Returns safe details for the currently authenticated user. */
    @Transactional(readOnly = true)
    public UserInfo currentUser(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found: " + userId));
        return UserInfo.from(user);
    }
}

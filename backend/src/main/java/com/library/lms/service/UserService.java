package com.library.lms.service;

import com.library.lms.dto.request.CreateUserRequest;
import com.library.lms.dto.request.UpdateUserRequest;
import com.library.lms.dto.response.PagedResponse;
import com.library.lms.dto.response.UserResponse;
import com.library.lms.entity.User;
import com.library.lms.exception.DuplicateResourceException;
import com.library.lms.exception.ResourceNotFoundException;
import com.library.lms.repository.UserRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@Transactional(readOnly = true)
public class UserService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    public UserService(UserRepository userRepository, PasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
    }

    /** Creates an account with a BCrypt-hashed password. */
    @Transactional
    public UserResponse create(CreateUserRequest request) {
        String username = request.getUsername().trim();
        String email = request.getEmail().trim();

        if (userRepository.existsByUsername(username)) {
            throw new DuplicateResourceException("Username is already in use: " + username);
        }
        if (userRepository.existsByEmail(email)) {
            throw new DuplicateResourceException("Email is already in use: " + email);
        }

        User user = new User();
        user.setUsername(username);
        user.setEmail(email);
        user.setPasswordHash(passwordEncoder.encode(request.getPassword()));
        user.setRole(request.getRole());
        user.setStatus(User.Status.ACTIVE);
        return new UserResponse(userRepository.save(user));
    }

    public PagedResponse<UserResponse> getAll(Pageable pageable) {
        Page<User> page = userRepository.findAll(pageable);
        return PagedResponse.from(page, UserResponse::new);
    }

    public UserResponse getById(Long userId) {
        return new UserResponse(findUser(userId));
    }

    @Transactional
    public UserResponse update(Long userId, UpdateUserRequest request) {
        User user = findUser(userId);
        String email = request.getEmail().trim();

        userRepository.findByEmail(email)
                .filter(other -> !other.getUserId().equals(userId))
                .ifPresent(other -> {
                    throw new DuplicateResourceException("Email is already in use: " + email);
                });

        user.setEmail(email);
        user.setRole(request.getRole());
        if (request.getPassword() != null && !request.getPassword().isBlank()) {
            user.setPasswordHash(passwordEncoder.encode(request.getPassword()));
        }
        return new UserResponse(userRepository.save(user));
    }

    /** Deactivation keeps all historical records intact. */
    @Transactional
    public UserResponse changeStatus(Long userId, User.Status status) {
        User user = findUser(userId);
        user.setStatus(status);
        return new UserResponse(userRepository.save(user));
    }

    private User findUser(Long userId) {
        return userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found: " + userId));
    }
}

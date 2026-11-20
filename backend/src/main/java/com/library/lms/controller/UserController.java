package com.library.lms.controller;

import com.library.lms.dto.request.CreateUserRequest;
import com.library.lms.dto.request.UpdateUserRequest;
import com.library.lms.dto.request.UserStatusRequest;
import com.library.lms.dto.response.PagedResponse;
import com.library.lms.dto.response.UserResponse;
import com.library.lms.service.UserService;
import jakarta.validation.Valid;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

/** Administrator-only system account management (section 6 of the API docs). */
@RestController
@RequestMapping("/api/v1/users")
@PreAuthorize("hasRole('ADMIN')")
public class UserController {

    private final UserService userService;

    public UserController(UserService userService) {
        this.userService = userService;
    }

    @PostMapping
    public ResponseEntity<UserResponse> create(@Valid @RequestBody CreateUserRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(userService.create(request));
    }

    @GetMapping
    public ResponseEntity<PagedResponse<UserResponse>> getAll(Pageable pageable) {
        return ResponseEntity.ok(userService.getAll(pageable));
    }

    @GetMapping("/{userId}")
    public ResponseEntity<UserResponse> getById(@PathVariable Long userId) {
        return ResponseEntity.ok(userService.getById(userId));
    }

    @PutMapping("/{userId}")
    public ResponseEntity<UserResponse> update(@PathVariable Long userId,
                                               @Valid @RequestBody UpdateUserRequest request) {
        return ResponseEntity.ok(userService.update(userId, request));
    }

    @PatchMapping("/{userId}/status")
    public ResponseEntity<UserResponse> changeStatus(@PathVariable Long userId,
                                                     @Valid @RequestBody UserStatusRequest request) {
        return ResponseEntity.ok(userService.changeStatus(userId, request.getStatus()));
    }
}

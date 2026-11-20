package com.library.lms.controller;

import com.library.lms.dto.request.AuthorRequest;
import com.library.lms.dto.response.AuthorResponse;
import com.library.lms.dto.response.PagedResponse;
import com.library.lms.service.AuthorService;
import jakarta.validation.Valid;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

/** Author management (section 9). Everyone reads; only staff write. */
@RestController
@RequestMapping("/api/v1/authors")
@PreAuthorize("hasAnyRole('ADMIN','LIBRARIAN','MEMBER')")
public class AuthorController {

    private final AuthorService authorService;

    public AuthorController(AuthorService authorService) {
        this.authorService = authorService;
    }

    @PostMapping
    @PreAuthorize("hasAnyRole('ADMIN','LIBRARIAN')")
    public ResponseEntity<AuthorResponse> create(@Valid @RequestBody AuthorRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(authorService.create(request));
    }

    @GetMapping
    public ResponseEntity<PagedResponse<AuthorResponse>> getAll(Pageable pageable) {
        return ResponseEntity.ok(authorService.getAll(pageable));
    }

    @GetMapping("/{authorId}")
    public ResponseEntity<AuthorResponse> getById(@PathVariable Long authorId) {
        return ResponseEntity.ok(authorService.getById(authorId));
    }

    @PutMapping("/{authorId}")
    @PreAuthorize("hasAnyRole('ADMIN','LIBRARIAN')")
    public ResponseEntity<AuthorResponse> update(@PathVariable Long authorId,
                                                 @Valid @RequestBody AuthorRequest request) {
        return ResponseEntity.ok(authorService.update(authorId, request));
    }

    @DeleteMapping("/{authorId}")
    @PreAuthorize("hasAnyRole('ADMIN','LIBRARIAN')")
    public ResponseEntity<Void> delete(@PathVariable Long authorId) {
        authorService.delete(authorId);
        return ResponseEntity.noContent().build();
    }
}

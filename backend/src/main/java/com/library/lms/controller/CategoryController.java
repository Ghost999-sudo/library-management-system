package com.library.lms.controller;

import com.library.lms.dto.request.CategoryRequest;
import com.library.lms.dto.response.CategoryResponse;
import com.library.lms.dto.response.PagedResponse;
import com.library.lms.service.CategoryService;
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

/** Category management (section 8). Everyone reads; only staff write. */
@RestController
@RequestMapping("/api/v1/categories")
@PreAuthorize("hasAnyRole('ADMIN','LIBRARIAN','MEMBER')")
public class CategoryController {

    private final CategoryService categoryService;

    public CategoryController(CategoryService categoryService) {
        this.categoryService = categoryService;
    }

    @PostMapping
    @PreAuthorize("hasAnyRole('ADMIN','LIBRARIAN')")
    public ResponseEntity<CategoryResponse> create(
            @Valid @RequestBody CategoryRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(categoryService.create(request));
    }

    @GetMapping
    public ResponseEntity<PagedResponse<CategoryResponse>> getAll(Pageable pageable) {
        return ResponseEntity.ok(categoryService.getAll(pageable));
    }

    @GetMapping("/{categoryId}")
    public ResponseEntity<CategoryResponse> getById(@PathVariable Long categoryId) {
        return ResponseEntity.ok(categoryService.getById(categoryId));
    }

    @PutMapping("/{categoryId}")
    @PreAuthorize("hasAnyRole('ADMIN','LIBRARIAN')")
    public ResponseEntity<CategoryResponse> update(@PathVariable Long categoryId,
                                                   @Valid @RequestBody CategoryRequest request) {
        return ResponseEntity.ok(categoryService.update(categoryId, request));
    }

    @DeleteMapping("/{categoryId}")
    @PreAuthorize("hasAnyRole('ADMIN','LIBRARIAN')")
    public ResponseEntity<Void> delete(@PathVariable Long categoryId) {
        categoryService.delete(categoryId);
        return ResponseEntity.noContent().build();
    }
}

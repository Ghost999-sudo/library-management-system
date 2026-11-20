package com.library.lms.controller;

import com.library.lms.dto.request.CreateBookRequest;
import com.library.lms.dto.request.UpdateBookRequest;
import com.library.lms.dto.response.BookResponse;
import com.library.lms.dto.response.PagedResponse;
import com.library.lms.service.BookService;
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
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

/** Book/catalogue management (section 10). Everyone reads; only staff write. */
@RestController
@RequestMapping("/api/v1/books")
@PreAuthorize("hasAnyRole('ADMIN','LIBRARIAN','MEMBER')")
public class BookController {

    private final BookService bookService;

    public BookController(BookService bookService) {
        this.bookService = bookService;
    }

    @PostMapping
    @PreAuthorize("hasAnyRole('ADMIN','LIBRARIAN')")
    public ResponseEntity<BookResponse> create(@Valid @RequestBody CreateBookRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(bookService.create(request));
    }

    @GetMapping
    public ResponseEntity<PagedResponse<BookResponse>> getAll(Pageable pageable) {
        return ResponseEntity.ok(bookService.getAll(pageable));
    }

    /** Mapped before /{bookId} so "search" is not treated as a numeric id. */
    @GetMapping("/search")
    public ResponseEntity<PagedResponse<BookResponse>> search(
            @RequestParam(defaultValue = "") String keyword, Pageable pageable) {
        return ResponseEntity.ok(bookService.search(keyword, pageable));
    }

    @GetMapping("/{bookId}")
    public ResponseEntity<BookResponse> getById(@PathVariable Long bookId) {
        return ResponseEntity.ok(bookService.getById(bookId));
    }

    @PutMapping("/{bookId}")
    @PreAuthorize("hasAnyRole('ADMIN','LIBRARIAN')")
    public ResponseEntity<BookResponse> update(@PathVariable Long bookId,
                                               @Valid @RequestBody UpdateBookRequest request) {
        return ResponseEntity.ok(bookService.update(bookId, request));
    }

    @DeleteMapping("/{bookId}")
    @PreAuthorize("hasAnyRole('ADMIN','LIBRARIAN')")
    public ResponseEntity<Void> delete(@PathVariable Long bookId) {
        bookService.delete(bookId);
        return ResponseEntity.noContent().build();
    }
}

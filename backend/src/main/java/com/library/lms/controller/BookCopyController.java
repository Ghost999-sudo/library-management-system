package com.library.lms.controller;

import com.library.lms.dto.request.CopyRequest;
import com.library.lms.dto.request.CopyStatusRequest;
import com.library.lms.dto.response.BookCopyResponse;
import com.library.lms.service.BookCopyService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

/** Physical-copy management (section 11). Everyone reads; only staff write. */
@RestController
@PreAuthorize("hasAnyRole('ADMIN','LIBRARIAN','MEMBER')")
public class BookCopyController {

    private final BookCopyService bookCopyService;

    public BookCopyController(BookCopyService bookCopyService) {
        this.bookCopyService = bookCopyService;
    }

    @PostMapping("/api/v1/books/{bookId}/copies")
    @PreAuthorize("hasAnyRole('ADMIN','LIBRARIAN')")
    public ResponseEntity<BookCopyResponse> addCopy(@PathVariable Long bookId,
                                                    @Valid @RequestBody CopyRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(bookCopyService.addCopy(bookId, request));
    }

    @GetMapping("/api/v1/books/{bookId}/copies")
    public ResponseEntity<List<BookCopyResponse>> getCopies(@PathVariable Long bookId) {
        return ResponseEntity.ok(bookCopyService.getCopies(bookId));
    }

    @GetMapping("/api/v1/books/{bookId}/copies/available")
    public ResponseEntity<List<BookCopyResponse>> getAvailableCopies(@PathVariable Long bookId) {
        return ResponseEntity.ok(bookCopyService.getAvailableCopies(bookId));
    }

    @PatchMapping("/api/v1/book-copies/{copyId}/status")
    @PreAuthorize("hasAnyRole('ADMIN','LIBRARIAN')")
    public ResponseEntity<BookCopyResponse> updateStatus(
            @PathVariable Long copyId, @Valid @RequestBody CopyStatusRequest request) {
        return ResponseEntity.ok(bookCopyService.updateStatus(copyId, request.getStatus()));
    }
}

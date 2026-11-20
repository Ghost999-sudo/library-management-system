package com.library.lms.service;

import com.library.lms.dto.request.CopyRequest;
import com.library.lms.dto.response.BookCopyResponse;
import com.library.lms.entity.Book;
import com.library.lms.entity.BookCopy;
import com.library.lms.entity.Loan;
import com.library.lms.exception.BusinessRuleException;
import com.library.lms.exception.DuplicateResourceException;
import com.library.lms.exception.ResourceNotFoundException;
import com.library.lms.repository.BookCopyRepository;
import com.library.lms.repository.BookRepository;
import com.library.lms.repository.LoanRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@Transactional(readOnly = true)
public class BookCopyService {

    private final BookCopyRepository bookCopyRepository;
    private final BookRepository bookRepository;
    private final LoanRepository loanRepository;

    public BookCopyService(BookCopyRepository bookCopyRepository,
                           BookRepository bookRepository,
                           LoanRepository loanRepository) {
        this.bookCopyRepository = bookCopyRepository;
        this.bookRepository = bookRepository;
        this.loanRepository = loanRepository;
    }

    @Transactional
    public BookCopyResponse addCopy(Long bookId, CopyRequest request) {
        Book book = bookRepository.findById(bookId)
                .orElseThrow(() -> new ResourceNotFoundException("Book not found: " + bookId));
        String accession = request.getAccessionNumber().trim();
        if (bookCopyRepository.existsByAccessionNumber(accession)) {
            throw new DuplicateResourceException(
                    "Accession number is already in use: " + accession);
        }
        BookCopy copy = new BookCopy();
        copy.setBook(book);
        copy.setAccessionNumber(accession);
        copy.setAcquiredDate(request.getAcquiredDate());
        copy.setStatus(BookCopy.Status.AVAILABLE);
        return new BookCopyResponse(bookCopyRepository.save(copy));
    }

    public List<BookCopyResponse> getCopies(Long bookId) {
        requireBook(bookId);
        return bookCopyRepository.findByBookBookId(bookId).stream()
                .map(BookCopyResponse::new)
                .toList();
    }

    public List<BookCopyResponse> getAvailableCopies(Long bookId) {
        requireBook(bookId);
        return bookCopyRepository.findByBookBookIdAndStatus(bookId, BookCopy.Status.AVAILABLE)
                .stream()
                .map(BookCopyResponse::new)
                .toList();
    }

    /**
     * A copy on an active loan cannot be flipped to AVAILABLE (or otherwise reassigned)
     * until the loan is resolved.
     */
    @Transactional
    public BookCopyResponse updateStatus(Long copyId, BookCopy.Status status) {
        BookCopy copy = bookCopyRepository.findById(copyId)
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Book copy not found: " + copyId));
        if (status != BookCopy.Status.BORROWED
                && loanRepository.existsByCopyCopyIdAndStatus(copyId, Loan.Status.BORROWED)) {
            throw new BusinessRuleException(
                    "Cannot change status: this copy has an active loan");
        }
        copy.setStatus(status);
        return new BookCopyResponse(bookCopyRepository.save(copy));
    }

    private void requireBook(Long bookId) {
        if (!bookRepository.existsById(bookId)) {
            throw new ResourceNotFoundException("Book not found: " + bookId);
        }
    }
}

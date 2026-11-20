package com.library.lms.service;

import com.library.lms.dto.request.CreateBookRequest;
import com.library.lms.dto.request.UpdateBookRequest;
import com.library.lms.dto.response.BookResponse;
import com.library.lms.dto.response.PagedResponse;
import com.library.lms.entity.Author;
import com.library.lms.entity.Book;
import com.library.lms.entity.BookAuthor;
import com.library.lms.entity.BookCopy;
import com.library.lms.entity.Category;
import com.library.lms.exception.BusinessRuleException;
import com.library.lms.exception.DuplicateResourceException;
import com.library.lms.exception.ResourceNotFoundException;
import com.library.lms.repository.AuthorRepository;
import com.library.lms.repository.BookCopyRepository;
import com.library.lms.repository.BookRepository;
import com.library.lms.repository.CategoryRepository;
import com.library.lms.repository.LoanRepository;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.LinkedHashSet;
import java.util.List;

@Service
@Transactional(readOnly = true)
public class BookService {

    private final BookRepository bookRepository;
    private final CategoryRepository categoryRepository;
    private final AuthorRepository authorRepository;
    private final BookCopyRepository bookCopyRepository;
    private final LoanRepository loanRepository;

    public BookService(BookRepository bookRepository,
                       CategoryRepository categoryRepository,
                       AuthorRepository authorRepository,
                       BookCopyRepository bookCopyRepository,
                       LoanRepository loanRepository) {
        this.bookRepository = bookRepository;
        this.categoryRepository = categoryRepository;
        this.authorRepository = authorRepository;
        this.bookCopyRepository = bookCopyRepository;
        this.loanRepository = loanRepository;
    }

    /**
     * Creates the title, its author links and its physical copies in one transaction.
     * Author links cascade from the managed Book, so a failure at any step rolls all back.
     */
    @Transactional
    public BookResponse create(CreateBookRequest request) {
        Category category = findCategory(request.getCategoryId());

        Book book = new Book();
        applyFields(book, category, request.getTitle(), request.getIsbn(),
                request.getPublisher(), request.getPublicationYear(), request.getDescription());
        Book saved = bookRepository.save(book);

        applyAuthorLinks(saved, request.getAuthorIds());

        if (request.getCopies() != null) {
            for (var copyRequest : request.getCopies()) {
                String accession = copyRequest.getAccessionNumber().trim();
                if (bookCopyRepository.existsByAccessionNumber(accession)) {
                    throw new DuplicateResourceException(
                            "Accession number is already in use: " + accession);
                }
                BookCopy copy = new BookCopy();
                copy.setBook(saved);
                copy.setAccessionNumber(accession);
                copy.setAcquiredDate(copyRequest.getAcquiredDate());
                copy.setStatus(BookCopy.Status.AVAILABLE);
                bookCopyRepository.save(copy);
            }
        }
        return getById(saved.getBookId());
    }

    public PagedResponse<BookResponse> getAll(Pageable pageable) {
        return PagedResponse.from(bookRepository.findAll(pageable), BookResponse::new);
    }

    public BookResponse getById(Long bookId) {
        Book book = bookRepository.findByIdWithDetails(bookId)
                .orElseThrow(() -> new ResourceNotFoundException("Book not found: " + bookId));
        return new BookResponse(book);
    }

    public PagedResponse<BookResponse> search(String keyword, Pageable pageable) {
        String term = keyword == null ? "" : keyword.trim();
        return PagedResponse.from(bookRepository.search(term, pageable), BookResponse::new);
    }

    @Transactional
    public BookResponse update(Long bookId, UpdateBookRequest request) {
        Book book = findBook(bookId);
        Category category = findCategory(request.getCategoryId());
        applyFields(book, category, request.getTitle(), request.getIsbn(),
                request.getPublisher(), request.getPublicationYear(), request.getDescription());

        // orphanRemoval deletes the old junction rows; the new links cascade on save.
        book.getBookAuthors().clear();
        applyAuthorLinks(book, request.getAuthorIds());
        bookRepository.save(book);
        return getById(bookId);
    }

    /** Rejects deletion while copies, loan history or author links still depend on the book. */
    @Transactional
    public void delete(Long bookId) {
        findBook(bookId);
        if (loanRepository.existsByCopyBookBookId(bookId)) {
            throw new BusinessRuleException(
                    "Cannot delete book: loan history exists for its copies");
        }
        if (bookCopyRepository.countByBookBookId(bookId) > 0) {
            throw new BusinessRuleException(
                    "Cannot delete book: it still has physical copies");
        }
        if (bookRepository.countAuthorLinksByBookId(bookId) > 0) {
            throw new BusinessRuleException(
                    "Cannot delete book: it is still linked to authors");
        }
        bookRepository.deleteById(bookId);
    }

    // ---------- internal helpers ----------

    private void applyFields(Book book, Category category, String title, String isbn,
                             String publisher, Integer year, String description) {
        book.setCategory(category);
        book.setTitle(title.trim());
        book.setIsbn(isbn);
        book.setPublisher(publisher);
        book.setPublicationYear(year);
        book.setDescription(description);
    }

    /** Replaces the collection contents with de-duplicated links for the given authors. */
    private void applyAuthorLinks(Book book, List<Long> authorIds) {
        if (authorIds == null) {
            return;
        }
        for (Long authorId : new LinkedHashSet<>(authorIds)) {
            Author author = authorRepository.findById(authorId)
                    .orElseThrow(() -> new ResourceNotFoundException(
                            "Author not found: " + authorId));
            BookAuthor link = new BookAuthor();
            link.setId(new BookAuthor.BookAuthorId(book.getBookId(), authorId));
            link.setBook(book);
            link.setAuthor(author);
            book.getBookAuthors().add(link);
        }
    }

    private Category findCategory(Long categoryId) {
        return categoryRepository.findById(categoryId)
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Category not found: " + categoryId));
    }

    private Book findBook(Long bookId) {
        return bookRepository.findById(bookId)
                .orElseThrow(() -> new ResourceNotFoundException("Book not found: " + bookId));
    }
}

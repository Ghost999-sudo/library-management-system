package com.library.lms.dto.response;

import com.library.lms.entity.Book;
import lombok.Getter;

import java.util.List;

/** Catalogue view: the title with its category, authors and copy availability. */
@Getter
public class BookResponse {

    private final Long bookId;
    private final Long categoryId;
    private final String categoryName;
    private final String title;
    private final String isbn;
    private final String publisher;
    private final Integer publicationYear;
    private final String description;
    private final List<AuthorResponse> authors;
    private final List<BookCopyResponse> copies;

    /** Maps inside the service transaction so lazy collections are already loaded. */
    public BookResponse(Book book) {
        this.bookId = book.getBookId();
        this.categoryId = book.getCategory().getCategoryId();
        this.categoryName = book.getCategory().getCategoryName();
        this.title = book.getTitle();
        this.isbn = book.getIsbn();
        this.publisher = book.getPublisher();
        this.publicationYear = book.getPublicationYear();
        this.description = book.getDescription();
        this.authors = book.getBookAuthors().stream()
                .map(link -> new AuthorResponse(link.getAuthor()))
                .toList();
        this.copies = book.getCopies().stream()
                .map(BookCopyResponse::new)
                .toList();
    }
}

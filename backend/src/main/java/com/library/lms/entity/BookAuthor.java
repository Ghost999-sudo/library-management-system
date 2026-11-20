package com.library.lms.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Embeddable;
import jakarta.persistence.EmbeddedId;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.MapsId;
import jakarta.persistence.Table;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.io.Serializable;
import java.util.Objects;

/** Maps the book_authors junction table with its composite primary key. */
@Entity
@Table(name = "book_authors")
@Getter
@Setter
@NoArgsConstructor
public class BookAuthor {

    @EmbeddedId
    private BookAuthorId id;

    @MapsId("bookId")
    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "book_id", nullable = false)
    private Book book;

    @MapsId("authorId")
    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "author_id", nullable = false)
    private Author author;

    @Embeddable
    @Getter
    @Setter
    @NoArgsConstructor
    public static class BookAuthorId implements Serializable {

        @Column(name = "book_id")
        private Long bookId;

        @Column(name = "author_id")
        private Long authorId;

        public BookAuthorId(Long bookId, Long authorId) {
            this.bookId = bookId;
            this.authorId = authorId;
        }

        @Override
        public boolean equals(Object other) {
            if (this == other) {
                return true;
            }
            if (!(other instanceof BookAuthorId that)) {
                return false;
            }
            return Objects.equals(bookId, that.bookId) && Objects.equals(authorId, that.authorId);
        }

        @Override
        public int hashCode() {
            return Objects.hash(bookId, authorId);
        }
    }
}

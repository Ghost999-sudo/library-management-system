package com.library.lms.repository;

import com.library.lms.entity.Book;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface BookRepository extends JpaRepository<Book, Long> {

    List<Book> findByIsbn(String isbn);

    List<Book> findByTitleContainingIgnoreCase(String title);

    boolean existsByCategoryCategoryId(Long categoryId);

    @Query("select count(ba) from BookAuthor ba where ba.book.bookId = :bookId")
    long countAuthorLinksByBookId(@Param("bookId") Long bookId);

    /**
     * Eagerly loads only the category. BookResponse initialises the two lazy
     * collection bags inside the service transaction; fetching both bags in
     * this query would trigger Hibernate's MultipleBagFetchException.
     */
    @EntityGraph(attributePaths = "category")
    @Query("select distinct b from Book b where b.bookId = :bookId")
    java.util.Optional<Book> findByIdWithDetails(@Param("bookId") Long bookId);

    /** Eagerly loads the category so list/search pages do not trigger one query per row. */
    @EntityGraph(attributePaths = "category")
    @Override
    Page<Book> findAll(Pageable pageable);

    /** Catalogue search across title, ISBN, publisher, authors and category. */
    @Query(value = "select distinct b from Book b " +
            "left join b.bookAuthors ba " +
            "left join ba.author a " +
            "left join b.category c " +
            "where lower(b.title) like lower(concat('%', :keyword, '%')) " +
            "or lower(coalesce(b.isbn, '')) like lower(concat('%', :keyword, '%')) " +
            "or lower(coalesce(b.publisher, '')) like lower(concat('%', :keyword, '%')) " +
            "or lower(a.authorName) like lower(concat('%', :keyword, '%')) " +
            "or lower(c.categoryName) like lower(concat('%', :keyword, '%'))",
            countQuery = "select count(distinct b) from Book b " +
                    "left join b.bookAuthors ba " +
                    "left join ba.author a " +
                    "left join b.category c " +
                    "where lower(b.title) like lower(concat('%', :keyword, '%')) " +
                    "or lower(coalesce(b.isbn, '')) like lower(concat('%', :keyword, '%')) " +
                    "or lower(coalesce(b.publisher, '')) like lower(concat('%', :keyword, '%')) " +
                    "or lower(a.authorName) like lower(concat('%', :keyword, '%')) " +
                    "or lower(c.categoryName) like lower(concat('%', :keyword, '%'))")
    Page<Book> search(@Param("keyword") String keyword, Pageable pageable);
}

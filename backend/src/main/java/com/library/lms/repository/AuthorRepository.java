package com.library.lms.repository;

import com.library.lms.entity.Author;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface AuthorRepository extends JpaRepository<Author, Long> {

    List<Author> findByAuthorName(String authorName);

    /** The junction table has no repository of its own, so author deletion needs this explicit query. */
    @Query("select count(ba) from BookAuthor ba where ba.author.authorId = :authorId")
    long countBookAuthorsByAuthorId(@Param("authorId") Long authorId);
}

package com.library.lms.dto.response;

import com.library.lms.entity.Author;
import lombok.Getter;

/** Safe author view. */
@Getter
public class AuthorResponse {

    private final Long authorId;
    private final String authorName;

    public AuthorResponse(Author author) {
        this.authorId = author.getAuthorId();
        this.authorName = author.getAuthorName();
    }
}

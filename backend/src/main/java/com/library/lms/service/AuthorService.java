package com.library.lms.service;

import com.library.lms.dto.request.AuthorRequest;
import com.library.lms.dto.response.AuthorResponse;
import com.library.lms.dto.response.PagedResponse;
import com.library.lms.entity.Author;
import com.library.lms.exception.BusinessRuleException;
import com.library.lms.exception.ResourceNotFoundException;
import com.library.lms.repository.AuthorRepository;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@Transactional(readOnly = true)
public class AuthorService {

    private final AuthorRepository authorRepository;

    public AuthorService(AuthorRepository authorRepository) {
        this.authorRepository = authorRepository;
    }

    @Transactional
    public AuthorResponse create(AuthorRequest request) {
        Author author = new Author();
        author.setAuthorName(request.getAuthorName().trim());
        return new AuthorResponse(authorRepository.save(author));
    }

    public PagedResponse<AuthorResponse> getAll(Pageable pageable) {
        return PagedResponse.from(authorRepository.findAll(pageable), AuthorResponse::new);
    }

    public AuthorResponse getById(Long authorId) {
        return new AuthorResponse(findAuthor(authorId));
    }

    @Transactional
    public AuthorResponse update(Long authorId, AuthorRequest request) {
        Author author = findAuthor(authorId);
        author.setAuthorName(request.getAuthorName().trim());
        return new AuthorResponse(authorRepository.save(author));
    }

    /** Author names are not unique, but the junction rows must be resolved before deletion. */
    @Transactional
    public void delete(Long authorId) {
        findAuthor(authorId);
        if (authorRepository.countBookAuthorsByAuthorId(authorId) > 0) {
            throw new BusinessRuleException(
                    "Cannot delete author: the author is linked to one or more books");
        }
        authorRepository.deleteById(authorId);
    }

    private Author findAuthor(Long authorId) {
        return authorRepository.findById(authorId)
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Author not found: " + authorId));
    }
}

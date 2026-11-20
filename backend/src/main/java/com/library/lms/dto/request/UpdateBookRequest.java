package com.library.lms.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.util.ArrayList;
import java.util.List;

/** Payload for PUT /api/v1/books/{bookId}. Copies are managed through their own endpoints. */
@Getter
@Setter
@NoArgsConstructor
public class UpdateBookRequest {

    @NotNull(message = "Category is required")
    private Long categoryId;

    @NotBlank(message = "Title is required")
    @Size(max = 255)
    private String title;

    @Size(max = 20)
    private String isbn;

    @Size(max = 150)
    private String publisher;

    private Integer publicationYear;

    @Size(max = 2000)
    private String description;

    private List<Long> authorIds = new ArrayList<>();
}

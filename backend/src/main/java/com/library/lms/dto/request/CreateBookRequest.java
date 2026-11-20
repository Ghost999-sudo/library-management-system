package com.library.lms.dto.request;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.util.ArrayList;
import java.util.List;

/** Payload for POST /api/v1/books. Creates the title, its author links and copies. */
@Getter
@Setter
@NoArgsConstructor
public class CreateBookRequest {

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

    private List<@Valid CopyRequest> copies = new ArrayList<>();
}

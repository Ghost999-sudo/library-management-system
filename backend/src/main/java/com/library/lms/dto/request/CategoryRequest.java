package com.library.lms.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

/** Payload for creating/updating a category. */
@Getter
@Setter
@NoArgsConstructor
public class CategoryRequest {

    @NotBlank(message = "Category name is required")
    @Size(max = 100)
    private String categoryName;

    @Size(max = 2000)
    private String description;
}

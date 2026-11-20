package com.library.lms.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

/** Payload for creating/updating an author. */
@Getter
@Setter
@NoArgsConstructor
public class AuthorRequest {

    @NotBlank(message = "Author name is required")
    @Size(max = 150)
    private String authorName;
}

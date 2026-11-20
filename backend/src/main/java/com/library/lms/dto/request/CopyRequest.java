package com.library.lms.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDate;

/** A physical copy, nested inside the Add Book request and reused for Add Copy. */
@Getter
@Setter
@NoArgsConstructor
public class CopyRequest {

    @NotBlank(message = "Accession number is required")
    @Size(max = 50)
    private String accessionNumber;

    private LocalDate acquiredDate;
}

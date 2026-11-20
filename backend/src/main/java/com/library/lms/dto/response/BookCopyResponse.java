package com.library.lms.dto.response;

import com.library.lms.entity.BookCopy;
import lombok.Getter;

import java.time.LocalDate;

/** Safe view of a physical copy, including its current availability status. */
@Getter
public class BookCopyResponse {

    private final Long copyId;
    private final String accessionNumber;
    private final String status;
    private final LocalDate acquiredDate;

    public BookCopyResponse(BookCopy copy) {
        this.copyId = copy.getCopyId();
        this.accessionNumber = copy.getAccessionNumber();
        this.status = copy.getStatus().name();
        this.acquiredDate = copy.getAcquiredDate();
    }
}

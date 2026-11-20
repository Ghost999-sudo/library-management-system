package com.library.lms.dto.response;

import com.library.lms.entity.BorrowRequest;
import lombok.Getter;

import java.time.LocalDate;

/** View of a borrow request, including the librarian's decision when present. */
@Getter
public class BorrowRequestResponse {

    private final Long requestId;
    private final Long bookId;
    private final String bookTitle;
    private final Long memberId;
    private final String memberName;
    private final BorrowRequest.Status status;
    private final LocalDate requestDate;
    private final Long decidedBy;
    private final LocalDate decidedDate;
    private final String note;

    /** Built inside a service transaction so lazy relations are already loaded. */
    public BorrowRequestResponse(BorrowRequest request) {
        this.requestId = request.getRequestId();
        this.bookId = request.getBook().getBookId();
        this.bookTitle = request.getBook().getTitle();
        this.memberId = request.getMember().getMemberId();
        this.memberName = request.getMember().getFirstName() + " " + request.getMember().getLastName();
        this.status = request.getStatus();
        this.requestDate = request.getRequestDate();
        this.decidedBy = request.getDecidedBy() == null ? null : request.getDecidedBy().getUserId();
        this.decidedDate = request.getDecidedDate();
        this.note = request.getNote();
    }
}

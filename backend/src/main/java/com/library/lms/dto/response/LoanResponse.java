package com.library.lms.dto.response;

import com.library.lms.entity.Loan;
import lombok.Getter;

import java.time.LocalDate;

/** Loan view for issue/history endpoints (section 12 of the REST API documentation). */
@Getter
public class LoanResponse {

    private final Long loanId;
    private final Long memberId;
    private final String memberName;
    private final Long copyId;
    private final String accessionNumber;
    private final String bookTitle;
    private final Long issuedBy;
    private final LocalDate issueDate;
    private final LocalDate dueDate;
    private final LocalDate returnDate;
    private final Loan.Status status;

    /** Built inside the service transaction so lazy relations are already loaded. */
    public LoanResponse(Loan loan) {
        this.loanId = loan.getLoanId();
        this.memberId = loan.getMember().getMemberId();
        this.memberName = loan.getMember().getFirstName() + " " + loan.getMember().getLastName();
        this.copyId = loan.getCopy().getCopyId();
        this.accessionNumber = loan.getCopy().getAccessionNumber();
        this.bookTitle = loan.getCopy().getBook().getTitle();
        this.issuedBy = loan.getIssuedBy().getUserId();
        this.issueDate = loan.getIssueDate();
        this.dueDate = loan.getDueDate();
        this.returnDate = loan.getReturnDate();
        this.status = loan.getStatus();
    }
}

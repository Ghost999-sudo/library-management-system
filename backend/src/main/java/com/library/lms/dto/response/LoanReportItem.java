package com.library.lms.dto.response;

import com.library.lms.entity.Loan;
import lombok.Getter;

import java.time.LocalDate;

/** One row in the loan date-range report. */
@Getter
public class LoanReportItem {

    private final Long loanId;
    private final String memberName;
    private final String bookTitle;
    private final String accessionNumber;
    private final Long issuedBy;
    private final LocalDate issueDate;
    private final LocalDate dueDate;
    private final LocalDate returnDate;
    private final Loan.Status status;

    public LoanReportItem(Loan loan) {
        this.loanId = loan.getLoanId();
        this.memberName = loan.getMember().getFirstName() + " " + loan.getMember().getLastName();
        this.bookTitle = loan.getCopy().getBook().getTitle();
        this.accessionNumber = loan.getCopy().getAccessionNumber();
        this.issuedBy = loan.getIssuedBy().getUserId();
        this.issueDate = loan.getIssueDate();
        this.dueDate = loan.getDueDate();
        this.returnDate = loan.getReturnDate();
        this.status = loan.getStatus();
    }
}

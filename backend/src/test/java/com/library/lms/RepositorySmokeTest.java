package com.library.lms;

import com.library.lms.entity.BookCopy;
import com.library.lms.entity.Fine;
import com.library.lms.entity.Loan;
import com.library.lms.entity.Member;
import com.library.lms.repository.AuthorRepository;
import com.library.lms.repository.BookCopyRepository;
import com.library.lms.repository.BookRepository;
import com.library.lms.repository.CategoryRepository;
import com.library.lms.repository.FinePaymentRepository;
import com.library.lms.repository.FineRepository;
import com.library.lms.repository.LibrarySettingsRepository;
import com.library.lms.repository.LoanRepository;
import com.library.lms.repository.MemberRepository;
import com.library.lms.repository.UserRepository;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.data.domain.PageRequest;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertTrue;

/** Read-only checks that repository beans and their queries are valid against the real schema. */
@SpringBootTest
class RepositorySmokeTest {

    private final UserRepository userRepository;
    private final MemberRepository memberRepository;
    private final CategoryRepository categoryRepository;
    private final AuthorRepository authorRepository;
    private final BookRepository bookRepository;
    private final BookCopyRepository bookCopyRepository;
    private final LoanRepository loanRepository;
    private final FineRepository fineRepository;
    private final FinePaymentRepository finePaymentRepository;
    private final LibrarySettingsRepository librarySettingsRepository;

    @Autowired
    RepositorySmokeTest(UserRepository userRepository,
                        MemberRepository memberRepository,
                        CategoryRepository categoryRepository,
                        AuthorRepository authorRepository,
                        BookRepository bookRepository,
                        BookCopyRepository bookCopyRepository,
                        LoanRepository loanRepository,
                        FineRepository fineRepository,
                        FinePaymentRepository finePaymentRepository,
                        LibrarySettingsRepository librarySettingsRepository) {
        this.userRepository = userRepository;
        this.memberRepository = memberRepository;
        this.categoryRepository = categoryRepository;
        this.authorRepository = authorRepository;
        this.bookRepository = bookRepository;
        this.bookCopyRepository = bookCopyRepository;
        this.loanRepository = loanRepository;
        this.fineRepository = fineRepository;
        this.finePaymentRepository = finePaymentRepository;
        this.librarySettingsRepository = librarySettingsRepository;
    }

    @Test
    void allTenRepositoriesAreCreated() {
        assertNotNull(userRepository);
        assertNotNull(memberRepository);
        assertNotNull(categoryRepository);
        assertNotNull(authorRepository);
        assertNotNull(bookRepository);
        assertNotNull(bookCopyRepository);
        assertNotNull(loanRepository);
        assertNotNull(fineRepository);
        assertNotNull(finePaymentRepository);
        assertNotNull(librarySettingsRepository);
    }

    @Test
    void representativeQueriesExecute() {
        assertTrue(userRepository.count() >= 0);
        assertTrue(memberRepository.countByStatus(Member.Status.ACTIVE) >= 0);
        assertTrue(!categoryRepository.existsByCategoryName("__not_a_real_category__"));
        assertTrue(authorRepository.countBookAuthorsByAuthorId(0L) == 0);

        bookRepository.search("", PageRequest.of(0, 1));
        assertTrue(bookCopyRepository.countByStatus(BookCopy.Status.AVAILABLE) >= 0);
        assertTrue(loanRepository.countByStatus(Loan.Status.BORROWED) >= 0);
        loanRepository.findByStatusAndDueDateBefore(Loan.Status.BORROWED, LocalDate.now());

        fineRepository.sumOutstandingByStatuses(
                List.of(Fine.Status.UNPAID, Fine.Status.PARTIALLY_PAID));
        finePaymentRepository.findByPaymentDateBetween(
                LocalDateTime.now().minusDays(1), LocalDateTime.now());

        librarySettingsRepository.findFirstByOrderBySettingIdAsc();
    }
}

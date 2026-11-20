package com.library.lms;

import com.library.lms.entity.Author;
import com.library.lms.entity.Book;
import com.library.lms.entity.BookAuthor;
import com.library.lms.entity.BookCopy;
import com.library.lms.entity.Category;
import com.library.lms.entity.User;
import com.library.lms.repository.AuthorRepository;
import com.library.lms.repository.BookCopyRepository;
import com.library.lms.repository.BookRepository;
import com.library.lms.repository.CategoryRepository;
import com.library.lms.repository.LoanRepository;
import com.library.lms.repository.UserRepository;
import com.library.lms.security.JwtTokenService;
import org.junit.jupiter.api.Test;
import org.mockito.ArgumentCaptor;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.Pageable;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;

import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.times;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.delete;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.patch;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

/**
 * HTTP-level checks for Phase 6. Repositories are mocked so no database rows are
 * inserted; security, controllers, services and DTO mapping are real.
 */
@SpringBootTest
@AutoConfigureMockMvc
class CatalogManagementTest {

    @Autowired
    private MockMvc mockMvc;
    @Autowired
    private JwtTokenService tokenService;
    @Autowired
    private PasswordEncoder passwordEncoder;

    @MockitoBean
    private UserRepository userRepository;
    @MockitoBean
    private CategoryRepository categoryRepository;
    @MockitoBean
    private AuthorRepository authorRepository;
    @MockitoBean
    private BookRepository bookRepository;
    @MockitoBean
    private BookCopyRepository bookCopyRepository;
    @MockitoBean
    private LoanRepository loanRepository;

    // ---------- Role enforcement and reads ----------

    @Test
    void memberCanReadCategoriesButCannotCreate() throws Exception {
        when(categoryRepository.findAll(any(Pageable.class)))
                .thenReturn(new PageImpl<>(List.of(), org.springframework.data.domain.PageRequest.of(0, 20), 0));

        mockMvc.perform(get("/api/v1/categories")
                        .header("Authorization", bearer(1L, User.Role.MEMBER)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.content").isArray());

        mockMvc.perform(post("/api/v1/categories")
                        .header("Authorization", bearer(1L, User.Role.MEMBER))
                        .contentType("application/json")
                        .content("{\"categoryName\":\"ICT\"}"))
                .andExpect(status().isForbidden());
    }

    @Test
    void librarianCanCreateCategory() throws Exception {
        when(categoryRepository.existsByCategoryName("Computer Science")).thenReturn(false);
        when(categoryRepository.save(any(Category.class))).thenAnswer(inv -> {
            Category c = inv.getArgument(0);
            c.setCategoryId(10L);
            return c;
        });

        mockMvc.perform(post("/api/v1/categories")
                        .header("Authorization", bearer(2L, User.Role.LIBRARIAN))
                        .contentType("application/json")
                        .content("{\"categoryName\":\"Computer Science\",\"description\":\"Books\"}"))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.categoryId").value(10))
                .andExpect(jsonPath("$.categoryName").value("Computer Science"));
    }

    @Test
    void categoryDeletionRejectedWhenBooksReferenceIt() throws Exception {
        Category category = category(10L, "Computer Science");
        when(categoryRepository.findById(10L)).thenReturn(Optional.of(category));
        when(bookRepository.existsByCategoryCategoryId(10L)).thenReturn(true);

        mockMvc.perform(delete("/api/v1/categories/10")
                        .header("Authorization", bearer(2L, User.Role.LIBRARIAN)))
                .andExpect(status().isConflict())
                .andExpect(jsonPath("$.status").value(409));
    }

    @Test
    void memberCanReadAuthorsButCannotCreate() throws Exception {
        when(authorRepository.findAll(any(Pageable.class)))
                .thenReturn(new PageImpl<>(List.of(), org.springframework.data.domain.PageRequest.of(0, 20), 0));

        mockMvc.perform(get("/api/v1/authors")
                        .header("Authorization", bearer(1L, User.Role.MEMBER)))
                .andExpect(status().isOk());

        mockMvc.perform(post("/api/v1/authors")
                        .header("Authorization", bearer(1L, User.Role.MEMBER))
                        .contentType("application/json")
                        .content("{\"authorName\":\"Robert C. Martin\"}"))
                .andExpect(status().isForbidden());
    }

    @Test
    void authorDeletionRejectedWhenLinkedToBooks() throws Exception {
        when(authorRepository.findById(3L)).thenReturn(Optional.of(author(3L, "Robert C. Martin")));
        when(authorRepository.countBookAuthorsByAuthorId(3L)).thenReturn(2L);

        mockMvc.perform(delete("/api/v1/authors/3")
                        .header("Authorization", bearer(3L, User.Role.ADMIN)))
                .andExpect(status().isConflict());
    }

    @Test
    void memberCanReadAndSearchBooksButCannotCreate() throws Exception {
        when(bookRepository.findAll(any(Pageable.class)))
                .thenReturn(new PageImpl<>(List.of(), org.springframework.data.domain.PageRequest.of(0, 20), 0));
        when(bookRepository.search(eq("java"), any(Pageable.class)))
                .thenReturn(new PageImpl<>(List.of(), org.springframework.data.domain.PageRequest.of(0, 20), 0));

        mockMvc.perform(get("/api/v1/books")
                        .header("Authorization", bearer(1L, User.Role.MEMBER)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.content").isArray());

        mockMvc.perform(get("/api/v1/books/search?keyword=java")
                        .header("Authorization", bearer(1L, User.Role.MEMBER)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.page").value(0));

        mockMvc.perform(post("/api/v1/books")
                        .header("Authorization", bearer(1L, User.Role.MEMBER))
                        .contentType("application/json")
                        .content("{\"categoryId\":1,\"title\":\"Clean Code\"}"))
                .andExpect(status().isForbidden());
    }

    // ---------- Book creation and deletion ----------

    @Test
    void createBookPersistsTitleAuthorsAndCopies() throws Exception {
        when(categoryRepository.findById(1L)).thenReturn(Optional.of(category(1L, "Computer Science")));
        when(bookRepository.save(any(Book.class))).thenAnswer(inv -> {
            Book b = inv.getArgument(0);
            b.setBookId(20L);
            return b;
        });
        when(authorRepository.findById(7L)).thenReturn(Optional.of(author(7L, "Robert C. Martin")));
        when(bookCopyRepository.existsByAccessionNumber(anyString())).thenReturn(false);
        when(bookCopyRepository.save(any(BookCopy.class))).thenAnswer(inv -> inv.getArgument(0));
        when(bookRepository.findByIdWithDetails(20L)).thenReturn(Optional.of(bookWithDetails(20L)));

        String body = """
                {"categoryId":1,"title":"Clean Code","isbn":"9780132350884",
                 "publisher":"Prentice Hall","publicationYear":2008,
                 "authorIds":[7,7],
                 "copies":[{"accessionNumber":"ACC001","acquiredDate":"2026-11-20"},
                           {"accessionNumber":"ACC002","acquiredDate":"2026-11-20"}]}
                """;

        mockMvc.perform(post("/api/v1/books")
                        .header("Authorization", bearer(3L, User.Role.ADMIN))
                        .contentType("application/json")
                        .content(body))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.bookId").value(20))
                .andExpect(jsonPath("$.categoryName").value("Computer Science"))
                .andExpect(jsonPath("$.title").value("Clean Code"))
                .andExpect(jsonPath("$.authors.length()").value(1))
                .andExpect(jsonPath("$.copies.length()").value(2));

        // Duplicate author ids are de-duplicated, and both copies are saved.
        var bookCaptor = ArgumentCaptor.forClass(Book.class);
        verify(bookRepository).save(bookCaptor.capture());
        assertEquals(1, bookCaptor.getValue().getBookAuthors().size());
        verify(bookCopyRepository, times(2)).save(any(BookCopy.class));
    }

    @Test
    void bookDeletionRejectedWhenLoanHistoryExists() throws Exception {
        when(bookRepository.findById(20L)).thenReturn(Optional.of(book(20L)));
        when(loanRepository.existsByCopyBookBookId(20L)).thenReturn(true);

        mockMvc.perform(delete("/api/v1/books/20")
                        .header("Authorization", bearer(2L, User.Role.LIBRARIAN)))
                .andExpect(status().isConflict())
                .andExpect(jsonPath("$.message").value(
                        "Cannot delete book: loan history exists for its copies"));
    }

    // ---------- Physical copies ----------

    @Test
    void librarianCanAddCopyToBook() throws Exception {
        when(bookRepository.findById(20L)).thenReturn(Optional.of(book(20L)));
        when(bookCopyRepository.existsByAccessionNumber("ACC003")).thenReturn(false);
        when(bookCopyRepository.save(any(BookCopy.class))).thenAnswer(inv -> {
            BookCopy c = inv.getArgument(0);
            c.setCopyId(30L);
            return c;
        });

        mockMvc.perform(post("/api/v1/books/20/copies")
                        .header("Authorization", bearer(2L, User.Role.LIBRARIAN))
                        .contentType("application/json")
                        .content("{\"accessionNumber\":\"ACC003\",\"acquiredDate\":\"2026-11-20\"}"))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.copyId").value(30))
                .andExpect(jsonPath("$.status").value("AVAILABLE"));
    }

    @Test
    void memberCanListAvailableCopies() throws Exception {
        when(bookRepository.existsById(20L)).thenReturn(true);
        when(bookCopyRepository.findByBookBookIdAndStatus(20L, BookCopy.Status.AVAILABLE))
                .thenReturn(List.of(copy(30L, BookCopy.Status.AVAILABLE)));

        mockMvc.perform(get("/api/v1/books/20/copies/available")
                        .header("Authorization", bearer(1L, User.Role.MEMBER)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].copyId").value(30))
                .andExpect(jsonPath("$[0].status").value("AVAILABLE"));
    }

    @Test
    void memberCannotChangeCopyStatus() throws Exception {
        mockMvc.perform(patch("/api/v1/book-copies/30/status")
                        .header("Authorization", bearer(1L, User.Role.MEMBER))
                        .contentType("application/json")
                        .content("{\"status\":\"DAMAGED\"}"))
                .andExpect(status().isForbidden());
    }

    @Test
    void copyStatusChangeRejectedWhileCopyIsOnLoan() throws Exception {
        when(bookCopyRepository.findById(30L))
                .thenReturn(Optional.of(copy(30L, BookCopy.Status.BORROWED)));
        when(loanRepository.existsByCopyCopyIdAndStatus(30L, com.library.lms.entity.Loan.Status.BORROWED))
                .thenReturn(true);

        mockMvc.perform(patch("/api/v1/book-copies/30/status")
                        .header("Authorization", bearer(2L, User.Role.LIBRARIAN))
                        .contentType("application/json")
                        .content("{\"status\":\"AVAILABLE\"}"))
                .andExpect(status().isConflict())
                .andExpect(jsonPath("$.message").value(
                        "Cannot change status: this copy has an active loan"));
    }

    // ---------- Helpers ----------

    private String bearer(Long userId, User.Role role) {
        User user = new User();
        user.setUserId(userId);
        user.setUsername("user" + userId);
        user.setEmail("user" + userId + "@example.com");
        user.setPasswordHash(passwordEncoder.encode("password123"));
        user.setRole(role);
        user.setStatus(User.Status.ACTIVE);
        when(userRepository.findById(userId)).thenReturn(Optional.of(user));
        return "Bearer " + tokenService.generateAccessToken(user);
    }

    private Category category(Long id, String name) {
        Category c = new Category();
        c.setCategoryId(id);
        c.setCategoryName(name);
        return c;
    }

    private Author author(Long id, String name) {
        Author a = new Author();
        a.setAuthorId(id);
        a.setAuthorName(name);
        return a;
    }

    private Book book(Long id) {
        Book b = new Book();
        b.setBookId(id);
        b.setCategory(category(1L, "Computer Science"));
        b.setTitle("Clean Code");
        return b;
    }

    private Book bookWithDetails(Long id) {
        Book b = book(id);
        BookAuthor link = new BookAuthor();
        link.setId(new BookAuthor.BookAuthorId(id, 7L));
        link.setBook(b);
        link.setAuthor(author(7L, "Robert C. Martin"));
        b.getBookAuthors().add(link);
        b.getCopies().add(copy(31L, BookCopy.Status.AVAILABLE));
        b.getCopies().add(copy(32L, BookCopy.Status.AVAILABLE));
        return b;
    }

    private BookCopy copy(Long id, BookCopy.Status status) {
        BookCopy c = new BookCopy();
        c.setCopyId(id);
        c.setAccessionNumber("ACC" + id);
        c.setStatus(status);
        return c;
    }
}

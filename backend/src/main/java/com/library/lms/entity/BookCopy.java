package com.library.lms.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.OneToMany;
import jakarta.persistence.Table;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;

/** Maps the existing book_copies table: one physical item of a book title. */
@Entity
@Table(name = "book_copies")
@Getter
@Setter
@NoArgsConstructor
public class BookCopy {

    public enum Status { AVAILABLE, BORROWED, DAMAGED, LOST }

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "copy_id")
    private Long copyId;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "book_id", nullable = false)
    private Book book;

    @Column(name = "accession_number", nullable = false, unique = true, length = 50)
    private String accessionNumber;

    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false,
            columnDefinition = "enum('AVAILABLE','BORROWED','DAMAGED','LOST')")
    private Status status = Status.AVAILABLE;

    @Column(name = "acquired_date")
    private LocalDate acquiredDate;

    @OneToMany(mappedBy = "copy", fetch = FetchType.LAZY)
    private List<Loan> loans = new ArrayList<>();
}

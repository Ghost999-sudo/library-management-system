package com.library.lms;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.jdbc.core.JdbcTemplate;

import java.util.List;
import java.util.Set;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertTrue;

/** Read-only checks that the existing MariaDB database is reachable and intact. */
@SpringBootTest
class DatabaseConnectivityTest {

    private final JdbcTemplate jdbcTemplate;

    @Autowired
    DatabaseConnectivityTest(JdbcTemplate jdbcTemplate) {
        this.jdbcTemplate = jdbcTemplate;
    }

    @Test
    void databaseIsReachable() {
        Integer result = jdbcTemplate.queryForObject("SELECT 1", Integer.class);
        assertEquals(1, result);
    }

    @Test
    void expectedTablesExist() {
        List<String> tables = jdbcTemplate.queryForList(
                "SELECT TABLE_NAME FROM INFORMATION_SCHEMA.TABLES " +
                        "WHERE TABLE_SCHEMA = DATABASE() AND TABLE_TYPE = 'BASE TABLE'",
                String.class);

        Set<String> expected = Set.of(
                "users", "members", "categories", "authors", "books", "book_authors",
                "book_copies", "loans", "fines", "fine_payments", "library_settings");

        List<String> missing = expected.stream().filter(table -> !tables.contains(table)).toList();
        assertTrue(missing.isEmpty(), "Missing tables: " + missing);
    }
}

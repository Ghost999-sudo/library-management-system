package com.library.lms.controller;

import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;

@RestController
public class DatabaseTestController {

    private final JdbcTemplate jdbcTemplate;

    public DatabaseTestController(JdbcTemplate jdbcTemplate) {
        this.jdbcTemplate = jdbcTemplate;
    }

    @GetMapping("/api/test/database")
    public Map<String, Object> testDatabase() {

        return jdbcTemplate.queryForMap(
            "SELECT VERSION() AS database_version, DATABASE() AS database_name"
        );
    }
}
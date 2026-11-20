package com.library.lms;

import jakarta.persistence.EntityManagerFactory;
import jakarta.persistence.metamodel.EntityType;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;

import java.util.Set;
import java.util.stream.Collectors;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertTrue;

/** Confirms that every documented table has a registered JPA entity. */
@SpringBootTest
class EntityMappingTest {

    private final EntityManagerFactory entityManagerFactory;

    @Autowired
    EntityMappingTest(EntityManagerFactory entityManagerFactory) {
        this.entityManagerFactory = entityManagerFactory;
    }

    @Test
    void allElevenEntitiesAreManaged() {
        Set<String> entityNames = entityManagerFactory.getMetamodel().getEntities().stream()
                .map(EntityType::getName)
                .collect(Collectors.toSet());

        assertEquals(11, entityNames.size(), "Unexpected number of managed entities: " + entityNames);
        assertTrue(entityNames.containsAll(Set.of(
                "User", "Member", "Category", "Author", "Book", "BookAuthor",
                "BookCopy", "Loan", "Fine", "FinePayment", "LibrarySettings")));
    }
}

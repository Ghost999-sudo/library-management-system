package com.library.lms.dto.response;

import com.library.lms.entity.Category;
import lombok.Getter;

/** Safe category view. */
@Getter
public class CategoryResponse {

    private final Long categoryId;
    private final String categoryName;
    private final String description;

    public CategoryResponse(Category category) {
        this.categoryId = category.getCategoryId();
        this.categoryName = category.getCategoryName();
        this.description = category.getDescription();
    }
}

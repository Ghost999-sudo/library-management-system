package com.library.lms.service;

import com.library.lms.dto.request.CategoryRequest;
import com.library.lms.dto.response.CategoryResponse;
import com.library.lms.dto.response.PagedResponse;
import com.library.lms.entity.Category;
import com.library.lms.exception.BusinessRuleException;
import com.library.lms.exception.DuplicateResourceException;
import com.library.lms.exception.ResourceNotFoundException;
import com.library.lms.repository.BookRepository;
import com.library.lms.repository.CategoryRepository;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@Transactional(readOnly = true)
public class CategoryService {

    private final CategoryRepository categoryRepository;
    private final BookRepository bookRepository;

    public CategoryService(CategoryRepository categoryRepository, BookRepository bookRepository) {
        this.categoryRepository = categoryRepository;
        this.bookRepository = bookRepository;
    }

    @Transactional
    public CategoryResponse create(CategoryRequest request) {
        String name = request.getCategoryName().trim();
        if (categoryRepository.existsByCategoryName(name)) {
            throw new DuplicateResourceException("Category name is already in use: " + name);
        }
        Category category = new Category();
        category.setCategoryName(name);
        category.setDescription(request.getDescription());
        return new CategoryResponse(categoryRepository.save(category));
    }

    public PagedResponse<CategoryResponse> getAll(Pageable pageable) {
        return PagedResponse.from(categoryRepository.findAll(pageable), CategoryResponse::new);
    }

    public CategoryResponse getById(Long categoryId) {
        return new CategoryResponse(findCategory(categoryId));
    }

    @Transactional
    public CategoryResponse update(Long categoryId, CategoryRequest request) {
        Category category = findCategory(categoryId);
        String name = request.getCategoryName().trim();
        categoryRepository.findByCategoryName(name)
                .filter(other -> !other.getCategoryId().equals(categoryId))
                .ifPresent(other -> {
                    throw new DuplicateResourceException(
                            "Category name is already in use: " + name);
                });
        category.setCategoryName(name);
        category.setDescription(request.getDescription());
        return new CategoryResponse(categoryRepository.save(category));
    }

    /** A category that still has books is retained rather than deleted. */
    @Transactional
    public void delete(Long categoryId) {
        findCategory(categoryId);
        if (bookRepository.existsByCategoryCategoryId(categoryId)) {
            throw new BusinessRuleException(
                    "Cannot delete category: it is still referenced by books");
        }
        categoryRepository.deleteById(categoryId);
    }

    private Category findCategory(Long categoryId) {
        return categoryRepository.findById(categoryId)
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Category not found: " + categoryId));
    }
}

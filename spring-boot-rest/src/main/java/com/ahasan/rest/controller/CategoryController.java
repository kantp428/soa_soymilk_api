package com.ahasan.rest.controller;

import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.ahasan.rest.common.exceptions.RecordNotFoundException;
import com.ahasan.rest.entity.CategoryEntity;
import com.ahasan.rest.repo.CategoryRepo;

@RestController
public class CategoryController extends ApiControllerSupport {

	private final CategoryRepo categoryRepo;

	public CategoryController(CategoryRepo categoryRepo) {
		this.categoryRepo = categoryRepo;
	}

	@GetMapping("/categories")
	public Map<String, Object> getAll(@RequestParam(required = false) Integer page,
			@RequestParam(required = false) Integer limit) {
		int normalizedPage = normalizePage(page);
		int normalizedLimit = normalizeLimit(limit, 10);
		Page<CategoryEntity> result = categoryRepo.findAll(PageRequest.of(normalizedPage - 1, normalizedLimit));
		List<Map<String, Object>> data = result.getContent().stream().map(this::toCategoryMap).collect(Collectors.toList());
		Map<String, Object> response = new LinkedHashMap<String, Object>();
		response.put("success", "Fetch Successfully");
		response.put("data", data);
		Map<String, Object> pagination = new LinkedHashMap<String, Object>();
		pagination.put("page", normalizedPage);
		pagination.put("limit", normalizedLimit);
		pagination.put("total", result.getTotalElements());
		pagination.put("total_pages", result.getTotalPages());
		response.put("pagination", pagination);
		return response;
	}

	@GetMapping("/categories/{id}")
	public Map<String, Object> getOne(@PathVariable Integer id) {
		CategoryEntity entity = categoryRepo.findById(id)
				.orElseThrow(() -> new RecordNotFoundException("Category id " + id + " not found"));
		return toCategoryMap(entity);
	}

	private Map<String, Object> toCategoryMap(CategoryEntity entity) {
		Map<String, Object> data = new LinkedHashMap<String, Object>();
		data.put("category_id", entity.getCategoryId());
		data.put("category_name", entity.getCategoryName());
		data.put("created_at", entity.getCreatedAt());
		return data;
	}
}

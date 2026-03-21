package com.ahasan.rest.controller;

import java.util.LinkedHashMap;
import java.util.Map;
import java.util.stream.Collectors;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.ahasan.rest.common.exceptions.RecordNotFoundException;
import com.ahasan.rest.entity.MenuEntity;
import com.ahasan.rest.repo.MenuRepo;

@RestController
public class MenuController extends ApiControllerSupport {

	private final MenuRepo menuRepo;

	public MenuController(MenuRepo menuRepo) {
		this.menuRepo = menuRepo;
	}

	@GetMapping("/menus")
	public Map<String, Object> getAll(@RequestParam(required = false) Integer page,
			@RequestParam(required = false) Integer limit) {
		int normalizedPage = normalizePage(page);
		int normalizedLimit = normalizeLimit(limit, 5);
		Page<MenuEntity> result = menuRepo.findAll(PageRequest.of(normalizedPage - 1, normalizedLimit));
		Map<String, Object> response = new LinkedHashMap<String, Object>();
		response.put("data", result.getContent().stream().map(this::toMenuMap).collect(Collectors.toList()));
		Map<String, Object> pagination = new LinkedHashMap<String, Object>();
		pagination.put("page", normalizedPage);
		pagination.put("limit", normalizedLimit);
		pagination.put("total", result.getTotalElements());
		pagination.put("total_pages", result.getTotalPages());
		response.put("pagination", pagination);
		return response;
	}

	@GetMapping("/menus/{id}")
	public Map<String, Object> getOne(@PathVariable Integer id) {
		return toMenuMap(getEntity(id));
	}

	@PostMapping("/menus")
	public Map<String, Object> create(@RequestBody Map<String, Object> body) {
		MenuEntity entity = new MenuEntity();
		applyMenu(entity, body);
		return messageData("create successfully", toMenuMap(menuRepo.save(entity)));
	}

	@PutMapping("/menus")
	public Map<String, Object> update(@RequestBody Map<String, Object> body) {
		Integer id = nullableInt(body.get("menu_id"));
		if (id == null) {
			throw new RecordNotFoundException("menu_id is required");
		}
		MenuEntity entity = getEntity(id);
		applyMenu(entity, body);
		return messageData("update successfully", toMenuMap(menuRepo.save(entity)));
	}

	private MenuEntity getEntity(Integer id) {
		return menuRepo.findById(id).orElseThrow(() -> new RecordNotFoundException("Menu id " + id + " not found"));
	}

	private void applyMenu(MenuEntity entity, Map<String, Object> body) {
		if (body.containsKey("category_id")) {
			entity.setCategoryId(nullableInt(body.get("category_id")));
		}
		if (body.containsKey("menu_name")) {
			entity.setMenuName(stringValue(body.get("menu_name")));
		}
		if (body.containsKey("description")) {
			entity.setDescription(stringValue(body.get("description")));
		}
		if (body.containsKey("price")) {
			entity.setPrice(decimalValue(body.get("price")));
		}
		if (body.containsKey("status")) {
			entity.setStatus(stringValue(body.get("status")));
		}
		if (body.containsKey("image_url")) {
			entity.setImageUrl(stringValue(body.get("image_url")));
		}
	}

	private Map<String, Object> toMenuMap(MenuEntity entity) {
		Map<String, Object> data = new LinkedHashMap<String, Object>();
		data.put("menu_id", entity.getMenuId());
		data.put("category_id", entity.getCategoryId());
		data.put("menu_name", entity.getMenuName());
		data.put("description", entity.getDescription());
		data.put("price", entity.getPrice());
		data.put("status", entity.getStatus());
		data.put("image_url", entity.getImageUrl());
		data.put("create_at", entity.getCreatedAt());
		data.put("update_at", entity.getUpdatedAt());
		return data;
	}
}

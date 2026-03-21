package com.ahasan.rest.controller;

import java.util.LinkedHashMap;
import java.util.List;
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
import com.ahasan.rest.entity.AddonEntity;
import com.ahasan.rest.repo.AddonRepo;

@RestController
public class AddonController extends ApiControllerSupport {

	private final AddonRepo addonRepo;

	public AddonController(AddonRepo addonRepo) {
		this.addonRepo = addonRepo;
	}

	@GetMapping("/addons")
	public Map<String, Object> getAll(@RequestParam(required = false) Integer page,
			@RequestParam(required = false) Integer limit) {
		int normalizedPage = normalizePage(page);
		int normalizedLimit = normalizeLimit(limit, 10);
		Page<AddonEntity> result = addonRepo.findAll(PageRequest.of(normalizedPage - 1, normalizedLimit));
		Map<String, Object> response = new LinkedHashMap<String, Object>();
		response.put("data", result.getContent().stream().map(this::toAddonMap).collect(Collectors.toList()));
		Map<String, Object> pagination = new LinkedHashMap<String, Object>();
		pagination.put("page", normalizedPage);
		pagination.put("limit", normalizedLimit);
		pagination.put("total", result.getTotalElements());
		pagination.put("total_pages", result.getTotalPages());
		response.put("pagination", pagination);
		return response;
	}

	@GetMapping("/addons/{id}")
	public Map<String, Object> getOne(@PathVariable Integer id) {
		return toAddonMap(getEntity(id));
	}

	@PostMapping("/addons")
	public Map<String, Object> create(@RequestBody Map<String, Object> body) {
		AddonEntity entity = new AddonEntity();
		applyAddon(entity, body);
		return messageData("create successfully", toAddonMap(addonRepo.save(entity)));
	}

	@PutMapping("/addons/{id}")
	public Map<String, Object> update(@PathVariable Integer id, @RequestBody Map<String, Object> body) {
		AddonEntity entity = getEntity(id);
		applyAddon(entity, body);
		return messageData("update successfully", toAddonMap(addonRepo.save(entity)));
	}

	private AddonEntity getEntity(Integer id) {
		return addonRepo.findById(id).orElseThrow(() -> new RecordNotFoundException("Addon id " + id + " not found"));
	}

	private void applyAddon(AddonEntity entity, Map<String, Object> body) {
		entity.setAddonName(stringValue(body.get("addon_name")));
		entity.setPrice(decimalValue(body.get("price")));
		if (body.containsKey("status")) {
			entity.setStatus(stringValue(body.get("status")));
		}
	}

	private Map<String, Object> toAddonMap(AddonEntity entity) {
		Map<String, Object> data = new LinkedHashMap<String, Object>();
		data.put("addon_id", entity.getAddonId());
		data.put("addon_name", entity.getAddonName());
		data.put("price", entity.getPrice());
		data.put("status", entity.getStatus());
		return data;
	}
}

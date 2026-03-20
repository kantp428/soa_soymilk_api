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
import com.ahasan.rest.entity.StaffEntity;
import com.ahasan.rest.repo.StaffRepo;

@RestController
public class StaffController extends ApiControllerSupport {

	private final StaffRepo staffRepo;

	public StaffController(StaffRepo staffRepo) {
		this.staffRepo = staffRepo;
	}

	@GetMapping("/staff")
	public Map<String, Object> getAll(@RequestParam(required = false) Integer page,
			@RequestParam(required = false) Integer limit) {
		int normalizedPage = normalizePage(page);
		int normalizedLimit = normalizeLimit(limit, 10);
		Page<StaffEntity> result = staffRepo.findAll(PageRequest.of(normalizedPage - 1, normalizedLimit));
		Map<String, Object> response = new LinkedHashMap<String, Object>();
		response.put("data", result.getContent().stream().map(this::toStaffMap).collect(Collectors.toList()));
		Map<String, Object> pagination = new LinkedHashMap<String, Object>();
		pagination.put("page", normalizedPage);
		pagination.put("limit", normalizedLimit);
		pagination.put("total", result.getTotalElements());
		pagination.put("total_pages", result.getTotalPages());
		response.put("pagination", pagination);
		return response;
	}

	@GetMapping("/staff/{id}")
	public Map<String, Object> getOne(@PathVariable Integer id) {
		return toStaffMap(getEntity(id));
	}

	@PostMapping("/staff")
	public Map<String, Object> create(@RequestBody Map<String, Object> body) {
		StaffEntity entity = new StaffEntity();
		applyStaff(entity, body);
		return messageData("create successfully", toStaffDetailMap(staffRepo.save(entity)));
	}

	@PutMapping("/staff/{id}")
	public Map<String, Object> update(@PathVariable Integer id, @RequestBody Map<String, Object> body) {
		StaffEntity entity = getEntity(id);
		applyStaff(entity, body);
		return messageData("update successfully", toStaffDetailMap(staffRepo.save(entity)));
	}

	private StaffEntity getEntity(Integer id) {
		return staffRepo.findById(id).orElseThrow(() -> new RecordNotFoundException("Staff id " + id + " not found"));
	}

	private void applyStaff(StaffEntity entity, Map<String, Object> body) {
		if (body.containsKey("staff_name")) {
			entity.setStaffName(stringValue(body.get("staff_name")));
		}
		if (body.containsKey("phone")) {
			entity.setPhone(stringValue(body.get("phone")));
		}
		if (body.containsKey("role")) {
			entity.setRole(stringValue(body.get("role")));
		}
		if (body.containsKey("status")) {
			entity.setStatus(stringValue(body.get("status")));
		}
	}

	private Map<String, Object> toStaffMap(StaffEntity entity) {
		Map<String, Object> data = new LinkedHashMap<String, Object>();
		data.put("staff_id", entity.getStaffId());
		data.put("staff_name", entity.getStaffName());
		data.put("phone", entity.getPhone());
		data.put("role", entity.getRole());
		data.put("status", entity.getStatus());
		data.put("created_at", entity.getCreatedAt());
		return data;
	}

	private Map<String, Object> toStaffDetailMap(StaffEntity entity) {
		Map<String, Object> data = toStaffMap(entity);
		data.put("created_at", entity.getCreatedAt());
		return data;
	}
}

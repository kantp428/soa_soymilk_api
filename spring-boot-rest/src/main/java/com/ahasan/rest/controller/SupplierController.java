package com.ahasan.rest.controller;

import java.util.LinkedHashMap;
import java.util.Map;
import java.util.stream.Collectors;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.ahasan.rest.common.exceptions.RecordNotFoundException;
import com.ahasan.rest.entity.SupplierEntity;
import com.ahasan.rest.repo.SupplierRepo;

@RestController
public class SupplierController extends ApiControllerSupport {

	private final SupplierRepo supplierRepo;

	public SupplierController(SupplierRepo supplierRepo) {
		this.supplierRepo = supplierRepo;
	}

	@GetMapping("/suppliers")
	public Map<String, Object> getAll(@RequestParam(required = false) Integer page,
			@RequestParam(required = false) Integer limit,
			@RequestParam(name = "seach", required = false) String search) {
		int normalizedPage = normalizePage(page);
		int normalizedLimit = normalizeLimit(limit, 10);
		Page<SupplierEntity> result = search == null || search.trim().isEmpty()
				? supplierRepo.findAll(PageRequest.of(normalizedPage - 1, normalizedLimit))
				: supplierRepo.findBySupplierNameContainingIgnoreCase(search.trim(), PageRequest.of(normalizedPage - 1, normalizedLimit));
		Map<String, Object> response = new LinkedHashMap<String, Object>();
		response.put("data", result.getContent().stream().map(this::toSupplierSummaryMap).collect(Collectors.toList()));
		Map<String, Object> pagination = new LinkedHashMap<String, Object>();
		pagination.put("total", result.getTotalElements());
		pagination.put("page", normalizedPage);
		pagination.put("limit", normalizedLimit);
		pagination.put("totalPage", result.getTotalPages());
		response.put("pagination", pagination);
		return response;
	}

	@GetMapping("/suppliers/{id}")
	public Map<String, Object> getOne(@PathVariable Integer id) {
		return toSupplierDetailMap(getEntity(id));
	}

	@PostMapping("/suppliers")
	public Map<String, Object> create(@RequestBody Map<String, Object> body) {
		SupplierEntity entity = new SupplierEntity();
		applySupplier(entity, body);
		supplierRepo.save(entity);
		return message("Supplier created successfully");
	}

	@PutMapping("/suppliers/{id}")
	public Map<String, Object> update(@PathVariable Integer id, @RequestBody Map<String, Object> body) {
		SupplierEntity entity = getEntity(id);
		applySupplier(entity, body);
		return messageData("Supplier updated", toSupplierUpdateMap(supplierRepo.save(entity)));
	}

	@PutMapping("/suppliers/inactive/{id}")
	public Map<String, Object> updateStatus(@PathVariable Integer id, @RequestBody Map<String, Object> body) {
		SupplierEntity entity = getEntity(id);
		entity.setStatus(stringValue(body.get("status")));
		supplierRepo.save(entity);
		Map<String, Object> data = new LinkedHashMap<String, Object>();
		data.put("supplierId", entity.getSupplierId());
		data.put("status", entity.getStatus());
		return messageData("Supplier updated", data);
	}

	@DeleteMapping("/suppliers/{id}")
	public Map<String, Object> delete(@PathVariable Integer id) {
		supplierRepo.delete(getEntity(id));
		return message("Supplier deleted successfully");
	}

	private SupplierEntity getEntity(Integer id) {
		return supplierRepo.findById(id)
				.orElseThrow(() -> new RecordNotFoundException("Supplier id " + id + " not found"));
	}

	private void applySupplier(SupplierEntity entity, Map<String, Object> body) {
		if (body.containsKey("supplierName")) {
			entity.setSupplierName(stringValue(body.get("supplierName")));
		}
		if (body.containsKey("phone")) {
			entity.setPhone(stringValue(body.get("phone")));
		}
		if (body.containsKey("address")) {
			entity.setAddress(stringValue(body.get("address")));
		}
		if (body.containsKey("status")) {
			entity.setStatus(stringValue(body.get("status")));
		}
	}

	private Map<String, Object> toSupplierSummaryMap(SupplierEntity entity) {
		Map<String, Object> data = new LinkedHashMap<String, Object>();
		data.put("id", entity.getSupplierId());
		data.put("supplierName", entity.getSupplierName());
		data.put("phone", entity.getPhone());
		return data;
	}

	private Map<String, Object> toSupplierDetailMap(SupplierEntity entity) {
		Map<String, Object> data = new LinkedHashMap<String, Object>();
		data.put("id", entity.getSupplierId());
		data.put("supplierName", entity.getSupplierName());
		data.put("phone", entity.getPhone());
		data.put("address", entity.getAddress());
		return data;
	}

	private Map<String, Object> toSupplierUpdateMap(SupplierEntity entity) {
		Map<String, Object> data = new LinkedHashMap<String, Object>();
		data.put("supplierId", entity.getSupplierId());
		data.put("supplierName", entity.getSupplierName());
		data.put("phone", entity.getPhone());
		data.put("address", entity.getAddress());
		data.put("status", entity.getStatus());
		return data;
	}
}

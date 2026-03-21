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
import com.ahasan.rest.entity.CustomerEntity;
import com.ahasan.rest.repo.CustomerRepo;

@RestController
public class CustomerController extends ApiControllerSupport {

	private final CustomerRepo customerRepo;

	public CustomerController(CustomerRepo customerRepo) {
		this.customerRepo = customerRepo;
	}

	@GetMapping("/customers")
	public Map<String, Object> getAll(@RequestParam(required = false) Integer page,
			@RequestParam(required = false) Integer limit) {
		int normalizedPage = normalizePage(page);
		int normalizedLimit = normalizeLimit(limit, 10);
		Page<CustomerEntity> result = customerRepo.findAll(PageRequest.of(normalizedPage - 1, normalizedLimit));
		Map<String, Object> response = new LinkedHashMap<String, Object>();
		response.put("data", result.getContent().stream().map(this::toCustomerMap).collect(Collectors.toList()));
		Map<String, Object> pagination = new LinkedHashMap<String, Object>();
		pagination.put("page", normalizedPage);
		pagination.put("limit", normalizedLimit);
		pagination.put("total", result.getTotalElements());
		pagination.put("total_pages", result.getTotalPages());
		response.put("pagination", pagination);
		return response;
	}

	@GetMapping("/customers/{id}")
	public Map<String, Object> getOne(@PathVariable Integer id) {
		return toCustomerMap(getEntity(id));
	}

	@PostMapping("/customers")
	public Map<String, Object> create(@RequestBody Map<String, Object> body) {
		CustomerEntity entity = new CustomerEntity();
		applyCustomer(entity, body);
		return messageData("create successfully", toCustomerMap(customerRepo.save(entity)));
	}

	@PutMapping("/customers/{id}")
	public Map<String, Object> update(@PathVariable Integer id, @RequestBody Map<String, Object> body) {
		CustomerEntity entity = getEntity(id);
		applyCustomer(entity, body);
		return messageData("update successfully", toCustomerMap(customerRepo.save(entity)));
	}

	@DeleteMapping("/customers/{id}")
	public Map<String, Object> delete(@PathVariable Integer id) {
		CustomerEntity entity = getEntity(id);
		customerRepo.delete(entity);
		return message("delete successfully");
	}

	private CustomerEntity getEntity(Integer id) {
		return customerRepo.findById(id).orElseThrow(() -> new RecordNotFoundException("Customer id " + id + " not found"));
	}

	private void applyCustomer(CustomerEntity entity, Map<String, Object> body) {
		if (body.containsKey("customer_name")) {
			entity.setCustomerName(stringValue(body.get("customer_name")));
		}
		if (body.containsKey("phone")) {
			entity.setPhone(stringValue(body.get("phone")));
		}
		if (body.containsKey("email")) {
			entity.setEmail(stringValue(body.get("email")));
		}
		if (body.containsKey("points")) {
			entity.setPoints(decimalValue(body.get("points")));
		}
	}

	private Map<String, Object> toCustomerMap(CustomerEntity entity) {
		Map<String, Object> data = new LinkedHashMap<String, Object>();
		data.put("customer_id", entity.getCustomerId());
		data.put("customer_name", entity.getCustomerName());
		data.put("phone", entity.getPhone());
		data.put("email", entity.getEmail());
		data.put("points", entity.getPoints());
		data.put("created_at", entity.getCreatedAt());
		data.put("updated_at", entity.getUpdatedAt());
		return data;
	}
}

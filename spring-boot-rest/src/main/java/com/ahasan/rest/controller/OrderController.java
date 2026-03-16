package com.ahasan.rest.controller;

import java.util.LinkedHashMap;
import java.util.Map;
import java.util.stream.Collectors;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.ahasan.rest.common.exceptions.RecordNotFoundException;
import com.ahasan.rest.entity.OrderEntity;
import com.ahasan.rest.repo.OrderRepo;

@RestController
public class OrderController extends ApiControllerSupport {

	private final OrderRepo orderRepo;

	public OrderController(OrderRepo orderRepo) {
		this.orderRepo = orderRepo;
	}

	@GetMapping("/orders")
	public Map<String, Object> getAll(@RequestParam(required = false) Integer page,
			@RequestParam(required = false) Integer limit) {
		int normalizedPage = normalizePage(page);
		int normalizedLimit = normalizeLimit(limit, 10);
		Page<OrderEntity> result = orderRepo.findAll(PageRequest.of(normalizedPage - 1, normalizedLimit));
		Map<String, Object> response = new LinkedHashMap<String, Object>();
		response.put("data", result.getContent().stream().map(this::toOrderMap).collect(Collectors.toList()));
		Map<String, Object> pagination = new LinkedHashMap<String, Object>();
		pagination.put("page", normalizedPage);
		pagination.put("limit", normalizedLimit);
		pagination.put("total", result.getTotalElements());
		pagination.put("total_pages", result.getTotalPages());
		response.put("pagination", pagination);
		return response;
	}

	@GetMapping("/orders/{id}")
	public Map<String, Object> getOne(@PathVariable Integer id) {
		return toOrderMap(orderRepo.findById(id).orElseThrow(() -> new RecordNotFoundException("Order id " + id + " not found")));
	}

	@PostMapping("/orders")
	public Map<String, Object> create(@RequestBody Map<String, Object> body) {
		OrderEntity entity = new OrderEntity();
		entity.setCustomerId(nullableInt(body.get("customer_id")));
		entity.setTotalPrice(decimalValue(body.get("total_price")));
		entity.setPaymentMethod(stringValue(body.get("payment_method")));
		entity.setOrderStatus(stringValue(body.get("order_status")));
		entity.setCouponId(nullableInt(body.get("coupon_id")));
		entity.setStaffId(nullableInt(body.get("staff_id")));
		return messageData("create successfully", toOrderMap(orderRepo.save(entity)));
	}

	private Map<String, Object> toOrderMap(OrderEntity entity) {
		Map<String, Object> data = new LinkedHashMap<String, Object>();
		data.put("order_id", entity.getOrderId());
		data.put("customer_id", entity.getCustomerId());
		data.put("order_time", entity.getCreatedAt());
		data.put("total_price", entity.getTotalPrice());
		data.put("payment_method", entity.getPaymentMethod());
		data.put("order_status", entity.getOrderStatus());
		data.put("coupon_id", entity.getCouponId());
		data.put("staff_id", entity.getStaffId());
		return data;
	}
}

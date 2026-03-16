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
import com.ahasan.rest.entity.OrderItemEntity;
import com.ahasan.rest.repo.OrderItemRepo;

@RestController
public class OrderItemController extends ApiControllerSupport {

	private final OrderItemRepo orderItemRepo;

	public OrderItemController(OrderItemRepo orderItemRepo) {
		this.orderItemRepo = orderItemRepo;
	}

	@GetMapping("/order-items")
	public Map<String, Object> getAll(@RequestParam(required = false) Integer page,
			@RequestParam(required = false) Integer limit) {
		int normalizedPage = normalizePage(page);
		int normalizedLimit = normalizeLimit(limit, 5);
		Page<OrderItemEntity> result = orderItemRepo.findAll(PageRequest.of(normalizedPage - 1, normalizedLimit));
		Map<String, Object> response = new LinkedHashMap<String, Object>();
		response.put("data", result.getContent().stream().map(this::toOrderItemMap).collect(Collectors.toList()));
		Map<String, Object> pagination = new LinkedHashMap<String, Object>();
		pagination.put("page", normalizedPage);
		pagination.put("limit", normalizedLimit);
		pagination.put("total", result.getTotalElements());
		pagination.put("total_pages", result.getTotalPages());
		response.put("pagination", pagination);
		return response;
	}

	@GetMapping("/order-items/{id}")
	public Map<String, Object> getOne(@PathVariable Integer id) {
		return toOrderItemMap(orderItemRepo.findById(id)
				.orElseThrow(() -> new RecordNotFoundException("Order item id " + id + " not found")));
	}

	@PostMapping("/order-items")
	public Map<String, Object> create(@RequestBody Map<String, Object> body) {
		OrderItemEntity entity = new OrderItemEntity();
		entity.setOrderId(intValue(body.get("order_id")));
		entity.setMenuId(intValue(body.get("menu_id")));
		entity.setQuantity(intValue(body.get("quantity")));
		entity.setPrice(decimalValue(body.get("price")));
		return toOrderItemMap(orderItemRepo.save(entity));
	}

	private Map<String, Object> toOrderItemMap(OrderItemEntity entity) {
		Map<String, Object> data = new LinkedHashMap<String, Object>();
		data.put("order_item_id", entity.getOrderItemId());
		data.put("order_id", entity.getOrderId());
		data.put("menu_id", entity.getMenuId());
		data.put("quantity", entity.getQuantity());
		data.put("price", entity.getPrice());
		return data;
	}
}

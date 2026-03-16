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
import com.ahasan.rest.entity.AddonEntity;
import com.ahasan.rest.entity.OrderItemAddonEntity;
import com.ahasan.rest.repo.AddonRepo;
import com.ahasan.rest.repo.OrderItemAddonRepo;

@RestController
public class OrderItemAddonController extends ApiControllerSupport {

	private final OrderItemAddonRepo orderItemAddonRepo;
	private final AddonRepo addonRepo;

	public OrderItemAddonController(OrderItemAddonRepo orderItemAddonRepo, AddonRepo addonRepo) {
		this.orderItemAddonRepo = orderItemAddonRepo;
		this.addonRepo = addonRepo;
	}

	@GetMapping("/order-item-addons")
	public Map<String, Object> getAll(@RequestParam(required = false) Integer page,
			@RequestParam(required = false) Integer limit) {
		int normalizedPage = normalizePage(page);
		int normalizedLimit = normalizeLimit(limit, 5);
		Page<OrderItemAddonEntity> result = orderItemAddonRepo.findAll(PageRequest.of(normalizedPage - 1, normalizedLimit));
		Map<String, Object> response = new LinkedHashMap<String, Object>();
		response.put("data", result.getContent().stream().map(this::toOrderItemAddonMap).collect(Collectors.toList()));
		Map<String, Object> pagination = new LinkedHashMap<String, Object>();
		pagination.put("page", normalizedPage);
		pagination.put("limit", normalizedLimit);
		pagination.put("total", result.getTotalElements());
		pagination.put("total_pages", result.getTotalPages());
		response.put("pagination", pagination);
		return response;
	}

	@GetMapping("/order-item-addons/{id}")
	public Map<String, Object> getOne(@PathVariable Integer id) {
		return toOrderItemAddonMap(getEntity(id));
	}

	@PostMapping("/order-item-addons")
	public Map<String, Object> create(@RequestBody Map<String, Object> body) {
		OrderItemAddonEntity entity = new OrderItemAddonEntity();
		entity.setOrderItemId(nullableInt(body.get("order_item_id")));
		entity.setAddonId(nullableInt(body.get("addon_id")));
		entity.setPrice(decimalValue(body.get("price")));
		return messageData("create successfully", toOrderItemAddonMap(orderItemAddonRepo.save(entity)));
	}

	private OrderItemAddonEntity getEntity(Integer id) {
		return orderItemAddonRepo.findById(id)
				.orElseThrow(() -> new RecordNotFoundException("Order item addon id " + id + " not found"));
	}

	private Map<String, Object> toOrderItemAddonMap(OrderItemAddonEntity entity) {
		Map<String, Object> data = new LinkedHashMap<String, Object>();
		data.put("order_item_addon_id", entity.getOrderItemAddonId());
		data.put("order_item_id", entity.getOrderItemId());
		data.put("addon_id", entity.getAddonId());
		AddonEntity addon = entity.getAddonId() == null ? null : addonRepo.findById(entity.getAddonId()).orElse(null);
		if (addon != null) {
			data.put("addon_name", addon.getAddonName());
		}
		data.put("price", entity.getPrice());
		return data;
	}
}

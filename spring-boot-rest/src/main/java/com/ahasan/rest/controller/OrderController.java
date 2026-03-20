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
import com.ahasan.rest.entity.OrderItemEntity;
import com.ahasan.rest.entity.OrderItemAddonEntity;
import com.ahasan.rest.repo.OrderRepo;
import com.ahasan.rest.repo.OrderItemRepo;
import com.ahasan.rest.repo.OrderItemAddonRepo;
import com.ahasan.rest.repo.MenuRepo;
import com.ahasan.rest.repo.AddonRepo;
import java.util.ArrayList;
import java.util.List;

@RestController
public class OrderController extends ApiControllerSupport {

	private final OrderRepo orderRepo;
	private final OrderItemRepo orderItemRepo;
	private final OrderItemAddonRepo orderItemAddonRepo;
	private final MenuRepo menuRepo;
	private final AddonRepo addonRepo;

	public OrderController(OrderRepo orderRepo, OrderItemRepo orderItemRepo, 
			OrderItemAddonRepo orderItemAddonRepo, MenuRepo menuRepo, AddonRepo addonRepo) {
		this.orderRepo = orderRepo;
		this.orderItemRepo = orderItemRepo;
		this.orderItemAddonRepo = orderItemAddonRepo;
		this.menuRepo = menuRepo;
		this.addonRepo = addonRepo;
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
		OrderEntity order = orderRepo.findById(id).orElseThrow(() -> new RecordNotFoundException("Order id " + id + " not found"));
		return toOrderMap(order);
	}

	@GetMapping("/orders/{id}/details")
	public Map<String, Object> getDetails(@PathVariable Integer id) {
		OrderEntity order = orderRepo.findById(id).orElseThrow(() -> new RecordNotFoundException("Order id " + id + " not found"));
		Map<String, Object> response = toOrderMap(order);
		
		List<OrderItemEntity> items = orderItemRepo.findByOrderId(id);
		List<Map<String, Object>> itemsList = new ArrayList<>();
		
		for (OrderItemEntity item : items) {
			Map<String, Object> itemMap = new LinkedHashMap<>();
			itemMap.put("order_item_id", item.getOrderItemId());
			itemMap.put("menu_id", item.getMenuId());
			itemMap.put("quantity", item.getQuantity());
			itemMap.put("price", item.getPrice());
			
			menuRepo.findById(item.getMenuId()).ifPresent(menu -> {
				itemMap.put("menu_name", menu.getMenuName());
			});
			
			List<OrderItemAddonEntity> addons = orderItemAddonRepo.findByOrderItemId(item.getOrderItemId());
			List<Map<String, Object>> addonsList = new ArrayList<>();
			for (OrderItemAddonEntity addon : addons) {
				Map<String, Object> addonMap = new LinkedHashMap<>();
				addonMap.put("addon_id", addon.getAddonId());
				addonRepo.findById(addon.getAddonId()).ifPresent(a -> {
					addonMap.put("addon_name", a.getAddonName());
					addonMap.put("price", a.getPrice());
				});
				addonsList.add(addonMap);
			}
			itemMap.put("addons", addonsList);
			itemsList.add(itemMap);
		}
		
		response.put("items", itemsList);
		return response;
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
		data.put("created_at", entity.getCreatedAt());
		data.put("total_price", entity.getTotalPrice());
		data.put("payment_method", entity.getPaymentMethod());
		data.put("order_status", entity.getOrderStatus());
		data.put("coupon_id", entity.getCouponId());
		data.put("staff_id", entity.getStaffId());
		return data;
	}
}

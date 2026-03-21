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
import com.ahasan.rest.entity.StockEntity;
import com.ahasan.rest.repo.StockRepo;

@RestController
public class StockController extends ApiControllerSupport {

	private final StockRepo stockRepo;

	public StockController(StockRepo stockRepo) {
		this.stockRepo = stockRepo;
	}

	@PostMapping("/stocks")
	public Map<String, Object> create(@RequestBody Map<String, Object> body) {
		StockEntity entity = new StockEntity();
		applyStock(entity, body);
		stockRepo.save(entity);
		return message("Stock created");
	}

	@GetMapping("/stocks")
	public Map<String, Object> getAll(@RequestParam(required = false) Integer page,
			@RequestParam(required = false) Integer limit) {
		int normalizedPage = normalizePage(page);
		int normalizedLimit = normalizeLimit(limit, 10);
		Page<StockEntity> result = stockRepo.findAll(PageRequest.of(normalizedPage - 1, normalizedLimit));
		Map<String, Object> response = message("Stocks fetched successfully");
		response.put("data", result.getContent().stream().map(this::toStockListMap).collect(Collectors.toList()));
		Map<String, Object> pagination = new LinkedHashMap<String, Object>();
		pagination.put("total", result.getTotalElements());
		pagination.put("page", normalizedPage);
		pagination.put("limit", normalizedLimit);
		pagination.put("total_pages", result.getTotalPages());
		response.put("pagination", pagination);
		return response;
	}

	@GetMapping("/stocks/{id}")
	public Map<String, Object> getOne(@PathVariable Integer id) {
		return messageData("Stock fetched successfully", toStockDetailMap(getEntity(id)));
	}

	@PutMapping("/stocks/{id}")
	public Map<String, Object> update(@PathVariable Integer id, @RequestBody Map<String, Object> body) {
		StockEntity entity = getEntity(id);
		applyStock(entity, body);
		return messageData("Stock updated successfully", toStockDetailMap(stockRepo.save(entity)));
	}

	private StockEntity getEntity(Integer id) {
		return stockRepo.findById(id).orElseThrow(() -> new RecordNotFoundException("Stock id " + id + " not found"));
	}

	private void applyStock(StockEntity entity, Map<String, Object> body) {
		if (body.containsKey("stock_name")) {
			entity.setStockName(stringValue(body.get("stock_name")));
		}
		if (body.containsKey("quantity")) {
			entity.setQuantity(intValue(body.get("quantity")));
		}
		if (body.containsKey("unit")) {
			entity.setUnit(stringValue(body.get("unit")));
		}
	}

	private Map<String, Object> toStockListMap(StockEntity entity) {
		Map<String, Object> data = toStockDetailMap(entity);
		data.put("updated_at", entity.getUpdatedAt());
		return data;
	}

	private Map<String, Object> toStockDetailMap(StockEntity entity) {
		Map<String, Object> data = new LinkedHashMap<String, Object>();
		data.put("stock_id", entity.getStockId());
		data.put("stock_name", entity.getStockName());
		data.put("quantity", entity.getQuantity());
		data.put("unit", entity.getUnit());
		return data;
	}
}

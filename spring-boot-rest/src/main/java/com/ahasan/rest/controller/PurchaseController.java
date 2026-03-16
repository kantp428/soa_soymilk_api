package com.ahasan.rest.controller;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
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
import com.ahasan.rest.entity.PurchaseEntity;
import com.ahasan.rest.entity.PurchaseItemEntity;
import com.ahasan.rest.entity.StockEntity;
import com.ahasan.rest.entity.SupplierEntity;
import com.ahasan.rest.repo.PurchaseItemRepo;
import com.ahasan.rest.repo.PurchaseRepo;
import com.ahasan.rest.repo.StockRepo;
import com.ahasan.rest.repo.SupplierRepo;

@RestController
public class PurchaseController extends ApiControllerSupport {

	private final PurchaseRepo purchaseRepo;
	private final PurchaseItemRepo purchaseItemRepo;
	private final SupplierRepo supplierRepo;
	private final StockRepo stockRepo;

	public PurchaseController(PurchaseRepo purchaseRepo, PurchaseItemRepo purchaseItemRepo, SupplierRepo supplierRepo,
			StockRepo stockRepo) {
		this.purchaseRepo = purchaseRepo;
		this.purchaseItemRepo = purchaseItemRepo;
		this.supplierRepo = supplierRepo;
		this.stockRepo = stockRepo;
	}

	@PostMapping("/purchases")
	public Map<String, Object> create(@RequestBody Map<String, Object> body) {
		PurchaseEntity entity = new PurchaseEntity();
		entity.setSupplierId(nullableInt(body.get("supplierId")));
		entity.setTotalCost(BigDecimal.ZERO);
		purchaseRepo.save(entity);
		return message("Purchase created");
	}

	@GetMapping("/purchases")
	public Map<String, Object> getAll(@RequestParam(required = false) Integer page,
			@RequestParam(required = false) Integer limit,
			@RequestParam(required = false) String search) {
		int normalizedPage = normalizePage(page);
		int normalizedLimit = normalizeLimit(limit, 10);
		Page<PurchaseEntity> result = purchaseRepo.findAll(PageRequest.of(normalizedPage - 1, normalizedLimit));
		List<Map<String, Object>> data = result.getContent().stream()
				.filter(purchase -> matchPurchaseSearch(purchase, search))
				.map(this::toPurchaseSummaryMap)
				.collect(Collectors.toList());
		Map<String, Object> response = message("Purchases fetched successfully");
		response.put("data", data);
		Map<String, Object> pagination = new LinkedHashMap<String, Object>();
		pagination.put("total", result.getTotalElements());
		pagination.put("page", normalizedPage);
		pagination.put("limit", normalizedLimit);
		pagination.put("totalpage", result.getTotalPages());
		response.put("pagination", pagination);
		return response;
	}

	@GetMapping("/purchases/{id}")
	public Map<String, Object> getOne(@PathVariable Integer id) {
		return messageData("Purchase fetched successfully", toPurchaseDetailMap(getPurchase(id)));
	}

	@GetMapping("/purchases/{id}/items")
	public Map<String, Object> getItems(@PathVariable Integer id) {
		getPurchase(id);
		Map<String, Object> response = new LinkedHashMap<String, Object>();
		response.put("purchaseId", id);
		response.put("items", purchaseItemRepo.findByPurchaseId(id).stream().map(this::toPurchaseItemSummaryMap)
				.collect(Collectors.toList()));
		return response;
	}

	@PostMapping("/purchases/{purchaseId}/items")
	public Map<String, Object> addItems(@PathVariable("purchaseId") Integer purchaseId,
			@RequestBody Map<String, Object> body) {
		PurchaseEntity purchase = getPurchase(purchaseId);
		List<Map<String, Object>> items = (List<Map<String, Object>>) body.get("items");
		List<Map<String, Object>> itemsAdded = new ArrayList<Map<String, Object>>();
		BigDecimal total = purchase.getTotalCost() == null ? BigDecimal.ZERO : purchase.getTotalCost();
		for (Map<String, Object> itemBody : safeList(items)) {
			PurchaseItemEntity item = new PurchaseItemEntity();
			item.setPurchaseId(purchaseId);
			item.setStockId(nullableInt(itemBody.get("stockId")));
			item.setQuantity(decimalValue(itemBody.get("quantity")));
			item.setPrice(decimalValue(itemBody.get("price")));
			PurchaseItemEntity saved = purchaseItemRepo.save(item);
			BigDecimal itemTotal = saved.getPrice().multiply(saved.getQuantity());
			total = total.add(itemTotal);
			Map<String, Object> added = toPurchaseItemSummaryMap(saved);
			added.put("total", itemTotal);
			itemsAdded.add(added);
		}
		purchase.setTotalCost(total);
		purchaseRepo.save(purchase);
		Map<String, Object> data = new LinkedHashMap<String, Object>();
		data.put("purchaseId", purchaseId);
		data.put("itemsAdded", itemsAdded);
		data.put("totalCost", total);
		return messageData("Items added successfully", data);
	}

	private boolean matchPurchaseSearch(PurchaseEntity purchase, String search) {
		if (search == null || search.trim().isEmpty()) {
			return true;
		}
		SupplierEntity supplier = purchase.getSupplierId() == null ? null : supplierRepo.findById(purchase.getSupplierId()).orElse(null);
		String name = supplier == null ? "" : supplier.getSupplierName();
		return name != null && name.toLowerCase().contains(search.trim().toLowerCase());
	}

	private PurchaseEntity getPurchase(Integer id) {
		return purchaseRepo.findById(id)
				.orElseThrow(() -> new RecordNotFoundException("Purchase id " + id + " not found"));
	}

	private Map<String, Object> toPurchaseSummaryMap(PurchaseEntity entity) {
		Map<String, Object> data = new LinkedHashMap<String, Object>();
		SupplierEntity supplier = entity.getSupplierId() == null ? null : supplierRepo.findById(entity.getSupplierId()).orElse(null);
		data.put("purchaseId", entity.getPurchaseId());
		data.put("supplierId", entity.getSupplierId());
		data.put("supplierName", supplier == null ? null : supplier.getSupplierName());
		data.put("purchaseDate", entity.getCreateAt() == null ? null : entity.getCreateAt().toLocalDate());
		data.put("totalCost", entity.getTotalCost());
		return data;
	}

	private Map<String, Object> toPurchaseDetailMap(PurchaseEntity entity) {
		Map<String, Object> data = toPurchaseSummaryMap(entity);
		List<Map<String, Object>> items = purchaseItemRepo.findByPurchaseId(entity.getPurchaseId()).stream()
				.map(this::toPurchaseItemDetailMap)
				.collect(Collectors.toList());
		data.put("items", items);
		return data;
	}

	private Map<String, Object> toPurchaseItemSummaryMap(PurchaseItemEntity entity) {
		Map<String, Object> data = new LinkedHashMap<String, Object>();
		data.put("purchaseItemId", entity.getPurchaseItemId());
		data.put("stockId", entity.getStockId());
		data.put("quantity", entity.getQuantity());
		data.put("price", entity.getPrice());
		return data;
	}

	private Map<String, Object> toPurchaseItemDetailMap(PurchaseItemEntity entity) {
		Map<String, Object> data = toPurchaseItemSummaryMap(entity);
		StockEntity stock = entity.getStockId() == null ? null : stockRepo.findById(entity.getStockId()).orElse(null);
		data.put("stockName", stock == null ? null : stock.getStockName());
		data.put("total", entity.getPrice().multiply(entity.getQuantity()));
		return data;
	}
}

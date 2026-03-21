package com.ahasan.rest.controller;

import java.math.BigDecimal;
import java.util.LinkedHashMap;
import java.util.Map;

import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RestController;

import com.ahasan.rest.common.exceptions.RecordNotFoundException;
import com.ahasan.rest.entity.PurchaseEntity;
import com.ahasan.rest.entity.PurchaseItemEntity;
import com.ahasan.rest.repo.PurchaseItemRepo;
import com.ahasan.rest.repo.PurchaseRepo;

@RestController
public class PurchaseItemController extends ApiControllerSupport {

	private final PurchaseItemRepo purchaseItemRepo;
	private final PurchaseRepo purchaseRepo;

	public PurchaseItemController(PurchaseItemRepo purchaseItemRepo, PurchaseRepo purchaseRepo) {
		this.purchaseItemRepo = purchaseItemRepo;
		this.purchaseRepo = purchaseRepo;
	}

	@PutMapping("/purchase-items/{id}")
	public Map<String, Object> update(@PathVariable Integer id, @RequestBody Map<String, Object> body) {
		PurchaseItemEntity entity = purchaseItemRepo.findById(id)
				.orElseThrow(() -> new RecordNotFoundException("Purchase item id " + id + " not found"));
		if (body.containsKey("stock_id")) {
			entity.setStockId(nullableInt(body.get("stock_id")));
		}
		if (body.containsKey("quantity")) {
			entity.setQuantity(decimalValue(body.get("quantity")));
		}
		if (body.containsKey("price")) {
			entity.setPrice(decimalValue(body.get("price")));
		}
		PurchaseItemEntity saved = purchaseItemRepo.save(entity);
		recalculatePurchaseTotal(saved.getPurchaseId());
		Map<String, Object> data = new LinkedHashMap<String, Object>();
		data.put("purchase_item_id", saved.getPurchaseItemId());
		data.put("stock_id", saved.getStockId());
		data.put("quantity", saved.getQuantity());
		data.put("price", saved.getPrice());
		data.put("total", saved.getPrice().multiply(saved.getQuantity()));
		return messageData("Purchase item updated successfully", data);
	}

	private void recalculatePurchaseTotal(Integer purchaseId) {
		if (purchaseId == null) {
			return;
		}
		PurchaseEntity purchase = purchaseRepo.findById(purchaseId)
				.orElseThrow(() -> new RecordNotFoundException("Purchase id " + purchaseId + " not found"));
		BigDecimal total = BigDecimal.ZERO;
		for (PurchaseItemEntity item : purchaseItemRepo.findByPurchaseId(purchaseId)) {
			total = total.add(item.getPrice().multiply(item.getQuantity()));
		}
		purchase.setTotalCost(total);
		purchaseRepo.save(purchase);
	}
}

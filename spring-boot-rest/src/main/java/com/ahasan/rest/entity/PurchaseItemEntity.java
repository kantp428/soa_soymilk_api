package com.ahasan.rest.entity;

import java.math.BigDecimal;
import java.time.LocalDateTime;

import javax.persistence.Column;
import javax.persistence.Entity;
import javax.persistence.GeneratedValue;
import javax.persistence.GenerationType;
import javax.persistence.Id;
import javax.persistence.Table;

import com.ahasan.rest.common.CrudEntity;

@Entity
@Table(name = "purchase_items")
public class PurchaseItemEntity implements CrudEntity {

	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	@Column(name = "purchase_item_id")
	private Integer purchaseItemId;

	@Column(name = "purchase_id")
	private Integer purchaseId;

	@Column(name = "stock_id")
	private Integer stockId;

	@Column(name = "quantity", precision = 10, scale = 2)
	private BigDecimal quantity;

	@Column(name = "price", precision = 10, scale = 2)
	private BigDecimal price;

	@Column(name = "created_at", insertable = false, updatable = false)
	private LocalDateTime createdAt;

	@Column(name = "updated_at", insertable = false, updatable = false)
	private LocalDateTime updatedAt;

	@Override
	public Integer getId() {
		return purchaseItemId;
	}

	@Override
	public void setId(Integer id) {
		this.purchaseItemId = id;
	}

	public Integer getPurchaseItemId() {
		return purchaseItemId;
	}

	public void setPurchaseItemId(Integer purchaseItemId) {
		this.purchaseItemId = purchaseItemId;
	}

	public Integer getPurchaseId() {
		return purchaseId;
	}

	public void setPurchaseId(Integer purchaseId) {
		this.purchaseId = purchaseId;
	}

	public Integer getStockId() {
		return stockId;
	}

	public void setStockId(Integer stockId) {
		this.stockId = stockId;
	}

	public BigDecimal getQuantity() {
		return quantity;
	}

	public void setQuantity(BigDecimal quantity) {
		this.quantity = quantity;
	}

	public BigDecimal getPrice() {
		return price;
	}

	public void setPrice(BigDecimal price) {
		this.price = price;
	}

	public LocalDateTime getCreatedAt() {
		return createdAt;
	}

	public void setCreatedAt(LocalDateTime createdAt) {
		this.createdAt = createdAt;
	}

	public LocalDateTime getUpdatedAt() {
		return updatedAt;
	}

	public void setUpdatedAt(LocalDateTime updatedAt) {
		this.updatedAt = updatedAt;
	}
}

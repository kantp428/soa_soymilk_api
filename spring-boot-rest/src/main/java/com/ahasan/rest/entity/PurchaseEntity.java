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
@Table(name = "purchases")
public class PurchaseEntity implements CrudEntity {

	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	@Column(name = "purchase_id")
	private Integer purchaseId;

	@Column(name = "supplier_id")
	private Integer supplierId;

	@Column(name = "total_cost", precision = 10, scale = 2)
	private BigDecimal totalCost;

	@Column(name = "create_at", insertable = false, updatable = false)
	private LocalDateTime createAt;

	@Override
	public Integer getId() {
		return purchaseId;
	}

	@Override
	public void setId(Integer id) {
		this.purchaseId = id;
	}

	public Integer getPurchaseId() {
		return purchaseId;
	}

	public void setPurchaseId(Integer purchaseId) {
		this.purchaseId = purchaseId;
	}

	public Integer getSupplierId() {
		return supplierId;
	}

	public void setSupplierId(Integer supplierId) {
		this.supplierId = supplierId;
	}

	public BigDecimal getTotalCost() {
		return totalCost;
	}

	public void setTotalCost(BigDecimal totalCost) {
		this.totalCost = totalCost;
	}

	public LocalDateTime getCreateAt() {
		return createAt;
	}

	public void setCreateAt(LocalDateTime createAt) {
		this.createAt = createAt;
	}
}

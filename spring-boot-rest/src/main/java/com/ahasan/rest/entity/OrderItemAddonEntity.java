package com.ahasan.rest.entity;

import java.math.BigDecimal;

import javax.persistence.Column;
import javax.persistence.Entity;
import javax.persistence.GeneratedValue;
import javax.persistence.GenerationType;
import javax.persistence.Id;
import javax.persistence.Table;

import com.ahasan.rest.common.CrudEntity;

@Entity
@Table(name = "order_item_addons")
public class OrderItemAddonEntity implements CrudEntity {

	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	@Column(name = "order_item_addon_id")
	private Integer orderItemAddonId;

	@Column(name = "order_item_id")
	private Integer orderItemId;

	@Column(name = "addon_id")
	private Integer addonId;

	@Column(name = "price", precision = 10, scale = 2)
	private BigDecimal price;

	@Override
	public Integer getId() {
		return orderItemAddonId;
	}

	@Override
	public void setId(Integer id) {
		this.orderItemAddonId = id;
	}

	public Integer getOrderItemAddonId() {
		return orderItemAddonId;
	}

	public void setOrderItemAddonId(Integer orderItemAddonId) {
		this.orderItemAddonId = orderItemAddonId;
	}

	public Integer getOrderItemId() {
		return orderItemId;
	}

	public void setOrderItemId(Integer orderItemId) {
		this.orderItemId = orderItemId;
	}

	public Integer getAddonId() {
		return addonId;
	}

	public void setAddonId(Integer addonId) {
		this.addonId = addonId;
	}

	public BigDecimal getPrice() {
		return price;
	}

	public void setPrice(BigDecimal price) {
		this.price = price;
	}
}

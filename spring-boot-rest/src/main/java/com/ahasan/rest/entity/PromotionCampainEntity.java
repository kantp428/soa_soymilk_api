package com.ahasan.rest.entity;

import java.time.LocalDate;
import java.time.LocalDateTime;

import javax.persistence.Column;
import javax.persistence.Entity;
import javax.persistence.GeneratedValue;
import javax.persistence.GenerationType;
import javax.persistence.Id;
import javax.persistence.Table;

import com.ahasan.rest.common.CrudEntity;

@Entity
@Table(name = "promotion_campain")
public class PromotionCampainEntity implements CrudEntity {

	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	@Column(name = "promotion_campain_id")
	private Integer promotionCampainId;

	@Column(name = "name", nullable = false, length = 150)
	private String name;

	@Column(name = "discount", nullable = false)
	private Float discount;

	@Column(name = "created_at", insertable = false, updatable = false)
	private LocalDateTime createdAt;

	@Column(name = "expire_date", nullable = false)
	private LocalDate expireDate;

	@Override
	public Integer getId() {
		return promotionCampainId;
	}

	@Override
	public void setId(Integer id) {
		this.promotionCampainId = id;
	}

	public Integer getPromotionCampainId() {
		return promotionCampainId;
	}

	public void setPromotionCampainId(Integer promotionCampainId) {
		this.promotionCampainId = promotionCampainId;
	}

	public String getName() {
		return name;
	}

	public void setName(String name) {
		this.name = name;
	}

	public Float getDiscount() {
		return discount;
	}

	public void setDiscount(Float discount) {
		this.discount = discount;
	}

	public LocalDateTime getCreatedAt() {
		return createdAt;
	}

	public void setCreatedAt(LocalDateTime createdAt) {
		this.createdAt = createdAt;
	}

	public LocalDate getExpireDate() {
		return expireDate;
	}

	public void setExpireDate(LocalDate expireDate) {
		this.expireDate = expireDate;
	}
}

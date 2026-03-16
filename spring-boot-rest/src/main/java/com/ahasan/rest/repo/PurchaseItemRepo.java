package com.ahasan.rest.repo;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

import com.ahasan.rest.entity.PurchaseItemEntity;

public interface PurchaseItemRepo extends JpaRepository<PurchaseItemEntity, Integer> {

	List<PurchaseItemEntity> findByPurchaseId(Integer purchaseId);
}

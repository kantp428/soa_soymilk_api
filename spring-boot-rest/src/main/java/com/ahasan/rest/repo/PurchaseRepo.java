package com.ahasan.rest.repo;

import org.springframework.data.jpa.repository.JpaRepository;

import com.ahasan.rest.entity.PurchaseEntity;

public interface PurchaseRepo extends JpaRepository<PurchaseEntity, Integer> {
}

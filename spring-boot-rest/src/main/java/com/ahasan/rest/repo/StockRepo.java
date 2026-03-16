package com.ahasan.rest.repo;

import org.springframework.data.jpa.repository.JpaRepository;

import com.ahasan.rest.entity.StockEntity;

public interface StockRepo extends JpaRepository<StockEntity, Integer> {
}

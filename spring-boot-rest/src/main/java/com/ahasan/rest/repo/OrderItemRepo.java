package com.ahasan.rest.repo;

import org.springframework.data.jpa.repository.JpaRepository;

import com.ahasan.rest.entity.OrderItemEntity;

public interface OrderItemRepo extends JpaRepository<OrderItemEntity, Integer> {
}

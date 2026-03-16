package com.ahasan.rest.repo;

import org.springframework.data.jpa.repository.JpaRepository;

import com.ahasan.rest.entity.OrderItemAddonEntity;

public interface OrderItemAddonRepo extends JpaRepository<OrderItemAddonEntity, Integer> {
}

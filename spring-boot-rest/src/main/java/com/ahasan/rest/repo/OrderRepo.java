package com.ahasan.rest.repo;

import org.springframework.data.jpa.repository.JpaRepository;

import com.ahasan.rest.entity.OrderEntity;

public interface OrderRepo extends JpaRepository<OrderEntity, Integer> {
}

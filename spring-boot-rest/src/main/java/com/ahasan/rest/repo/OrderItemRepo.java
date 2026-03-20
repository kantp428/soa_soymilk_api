package com.ahasan.rest.repo;

import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;
import com.ahasan.rest.entity.OrderItemEntity;

public interface OrderItemRepo extends JpaRepository<OrderItemEntity, Integer> {
	List<OrderItemEntity> findByOrderId(Integer orderId);
}

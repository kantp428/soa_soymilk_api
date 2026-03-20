package com.ahasan.rest.repo;

import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;
import com.ahasan.rest.entity.OrderItemAddonEntity;

public interface OrderItemAddonRepo extends JpaRepository<OrderItemAddonEntity, Integer> {
	List<OrderItemAddonEntity> findByOrderItemId(Integer orderItemId);
}

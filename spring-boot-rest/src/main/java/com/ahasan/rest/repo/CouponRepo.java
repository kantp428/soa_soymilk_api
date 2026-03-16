package com.ahasan.rest.repo;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

import com.ahasan.rest.entity.CouponEntity;

public interface CouponRepo extends JpaRepository<CouponEntity, Integer> {

	Optional<CouponEntity> findByCouponCode(String couponCode);

	long countByPromotionCampainId(Integer promotionCampainId);

	long countByPromotionCampainIdAndStatus(Integer promotionCampainId, String status);
}

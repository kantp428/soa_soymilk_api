package com.ahasan.rest.controller;

import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.ahasan.rest.entity.CouponEntity;
import com.ahasan.rest.repo.CouponRepo;

@RestController
@RequestMapping("/coupons")
public class CouponController extends AbstractCrudController<CouponEntity> {

	public CouponController(CouponRepo repository) {
		super(repository, "Coupon");
	}
}

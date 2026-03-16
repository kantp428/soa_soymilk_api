package com.ahasan.rest.controller;

import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.ahasan.rest.entity.PromotionCampainEntity;
import com.ahasan.rest.repo.PromotionCampainRepo;

@RestController
@RequestMapping("/promotion-campain")
public class PromotionCampainController extends AbstractCrudController<PromotionCampainEntity> {

	public PromotionCampainController(PromotionCampainRepo repository) {
		super(repository, "Promotion campain");
	}
}

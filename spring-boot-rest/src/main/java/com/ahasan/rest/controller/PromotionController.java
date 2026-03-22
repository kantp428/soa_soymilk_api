package com.ahasan.rest.controller;

import java.time.LocalDateTime;
import java.util.LinkedHashMap;
import java.util.Map;
import java.util.UUID;
import java.util.stream.Collectors;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.ahasan.rest.common.exceptions.RecordNotFoundException;
import com.ahasan.rest.entity.CouponEntity;
import com.ahasan.rest.entity.PromotionCampainEntity;
import com.ahasan.rest.repo.CouponRepo;
import com.ahasan.rest.repo.PromotionCampainRepo;

@RestController
public class PromotionController extends ApiControllerSupport {

	private final PromotionCampainRepo promotionCampainRepo;
	private final CouponRepo couponRepo;

	public PromotionController(PromotionCampainRepo promotionCampainRepo, CouponRepo couponRepo) {
		this.promotionCampainRepo = promotionCampainRepo;
		this.couponRepo = couponRepo;
	}

	@GetMapping("/promotion/campaign")
	public Map<String, Object> getCampaigns(@RequestParam(required = false) Integer page,
			@RequestParam(required = false) Integer limit) {
		int normalizedPage = normalizePage(page);
		int normalizedLimit = normalizeLimit(limit, 10);
		Page<PromotionCampainEntity> result = promotionCampainRepo.findAll(PageRequest.of(normalizedPage - 1, normalizedLimit));
		Map<String, Object> response = new LinkedHashMap<String, Object>();
		response.put("data", result.getContent().stream().map(this::toCampaignMap).collect(Collectors.toList()));
		Map<String, Object> pagination = new LinkedHashMap<String, Object>();
		pagination.put("page", normalizedPage);
		pagination.put("limit", normalizedLimit);
		pagination.put("total", result.getTotalElements());
		pagination.put("total_pages", result.getTotalPages());
		response.put("pagination", pagination);
		return response;
	}

	@PostMapping("/promotion/campaign")
	public Map<String, Object> createCampaign(@RequestBody Map<String, Object> body) {
		PromotionCampainEntity entity = new PromotionCampainEntity();
		entity.setName(stringValue(body.get("name")));
		if (body.containsKey("discount")) {
			entity.setDiscount(Float.valueOf(stringValue(body.get("discount"))));
		}
		if (body.containsKey("expire_date")) {
			entity.setExpireDate(java.time.LocalDate.parse(stringValue(body.get("expire_date"))));
		}
		return messageData("create successfully", toCampaignDetailMap(promotionCampainRepo.save(entity)));
	}

	@PostMapping("/promotion/coupon")
	public Map<String, Object> createCoupon(@RequestBody Map<String, Object> body) {
		Integer promotionId = nullableInt(body.get("promotion_campain_id"));
		getCampaign(promotionId);
		CouponEntity coupon = new CouponEntity();
		coupon.setPromotionCampainId(promotionId);
		coupon.setCouponCode(generateCouponCode());
		coupon.setStatus("INACTIVE");
		return messageData("create successfully", toCouponDetailMap(couponRepo.save(coupon)));
	}

	@PostMapping("/colab/ice-cream")
	public Map<String, Object> createColabIceCreamCoupon() {
		Integer promotionId = 1;
		getCampaign(promotionId);
		CouponEntity coupon = new CouponEntity();
		coupon.setPromotionCampainId(promotionId);
		coupon.setCouponCode(generateCouponCode());
		coupon.setStatus("INACTIVE");
		return messageData("create ice cream successfully", toCouponDetailMap(couponRepo.save(coupon)));
	}

	@GetMapping("/promotion/campaign/{id}/coupon")
	public Map<String, Object> getCouponStats(@PathVariable Integer id) {
		getCampaign(id);
		long totalCoupons = couponRepo.countByPromotionCampainId(id);
		long activeCoupons = couponRepo.countByPromotionCampainIdAndStatus(id, "ACTIVE");
		Map<String, Object> response = new LinkedHashMap<String, Object>();
		response.put("used_coupons", activeCoupons);
		response.put("unused_coupons", totalCoupons - activeCoupons);
		response.put("total_coupons", totalCoupons);
		return response;
	}

	@PutMapping("/promotion/coupon/active")
	public Map<String, Object> activeCoupon(@RequestBody Map<String, Object> body) {
		CouponEntity coupon = getCouponByCode(stringValue(body.get("coupon_code")));
		coupon.setStatus("ACTIVE");
		coupon.setUsedAt(LocalDateTime.now());
		return messageData("active successfully", toCouponDetailMap(couponRepo.save(coupon)));
	}

	@PostMapping("/promotion/coupon/validate")
	public Map<String, Object> validateCoupon(@RequestBody Map<String, Object> body) {
		CouponEntity coupon = getCouponByCode(stringValue(body.get("coupon_code")));
		return messageData("valid coupon", toCouponMap(coupon));
	}

	private PromotionCampainEntity getCampaign(Integer id) {
		return promotionCampainRepo.findById(id)
				.orElseThrow(() -> new RecordNotFoundException("Promotion campaign id " + id + " not found"));
	}

	private CouponEntity getCouponByCode(String couponCode) {
		return couponRepo.findByCouponCode(couponCode)
				.orElseThrow(() -> new RecordNotFoundException("Coupon code " + couponCode + " not found"));
	}

	private String generateCouponCode() {
		return UUID.randomUUID().toString().replace("-", "").substring(0, 18).toUpperCase();
	}

	private Map<String, Object> toCampaignMap(PromotionCampainEntity entity) {
		Map<String, Object> data = new LinkedHashMap<String, Object>();
		data.put("promotion_campain_id", entity.getPromotionCampainId());
		data.put("name", entity.getName());
		data.put("discount", entity.getDiscount());
		data.put("expire_date", entity.getExpireDate());
		return data;
	}

	private Map<String, Object> toCampaignDetailMap(PromotionCampainEntity entity) {
		Map<String, Object> data = toCampaignMap(entity);
		data.put("created_at", entity.getCreatedAt());
		return data;
	}

	private Map<String, Object> toCouponMap(CouponEntity entity) {
		Map<String, Object> data = new LinkedHashMap<String, Object>();
		data.put("coupon_id", entity.getCouponId());
		data.put("coupon_code", entity.getCouponCode());
		data.put("promotion_campain_id", entity.getPromotionCampainId());
		data.put("status", entity.getStatus());
		return data;
	}

	private Map<String, Object> toCouponDetailMap(CouponEntity entity) {
		Map<String, Object> data = toCouponMap(entity);
		data.put("created_at", entity.getCreatedAt());
		data.put("used_at", entity.getUsedAt());
		return data;
	}
}

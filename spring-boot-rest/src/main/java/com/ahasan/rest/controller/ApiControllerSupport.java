package com.ahasan.rest.controller;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.Collections;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

public abstract class ApiControllerSupport {

	protected int normalizePage(Integer page) {
		return page == null || page < 1 ? 1 : page;
	}

	protected int normalizeLimit(Integer limit, int defaultLimit) {
		return limit == null || limit < 1 ? defaultLimit : limit;
	}

	protected int totalPages(long total, int limit) {
		return limit <= 0 ? 0 : (int) Math.ceil((double) total / (double) limit);
	}

	protected int intValue(Object value) {
		if (value == null) {
			return 0;
		}
		if (value instanceof Number) {
			return ((Number) value).intValue();
		}
		return Integer.parseInt(value.toString());
	}

	protected Integer nullableInt(Object value) {
		if (value == null || value.toString().trim().isEmpty()) {
			return null;
		}
		return intValue(value);
	}

	protected BigDecimal decimalValue(Object value) {
		if (value == null) {
			return BigDecimal.ZERO;
		}
		if (value instanceof BigDecimal) {
			return ((BigDecimal) value).setScale(2, RoundingMode.HALF_UP);
		}
		if (value instanceof Number) {
			return BigDecimal.valueOf(((Number) value).doubleValue()).setScale(2, RoundingMode.HALF_UP);
		}
		return new BigDecimal(value.toString()).setScale(2, RoundingMode.HALF_UP);
	}

	protected String stringValue(Object value) {
		return value == null ? null : value.toString();
	}

	protected <T> List<T> safeList(List<T> items) {
		return items == null ? Collections.<T>emptyList() : items;
	}

	protected Map<String, Object> message(String text) {
		Map<String, Object> response = new LinkedHashMap<String, Object>();
		response.put("message", text);
		return response;
	}

	protected Map<String, Object> messageData(String text, Object data) {
		Map<String, Object> response = message(text);
		response.put("data", data);
		return response;
	}
}

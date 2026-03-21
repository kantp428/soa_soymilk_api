package com.ahasan.rest.common.exceptions;

public class ErrorResponse {

	private String status;

	private String error;

	private String message;

	public ErrorResponse(String status, String error, String message) {
		this.status = status;
		this.error = error;
		this.message = message;
	}

	public String getStatus() {
		return status;
	}

	public void setStatus(String status) {
		this.status = status;
	}

	public String getError() {
		return error;
	}

	public void setError(String error) {
		this.error = error;
	}

	public String getMessage() {
		return message;
	}

	public void setMessage(String message) {
		this.message = message;
	}
}

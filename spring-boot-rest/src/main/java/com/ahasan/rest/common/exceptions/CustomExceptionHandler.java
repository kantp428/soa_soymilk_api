package com.ahasan.rest.common.exceptions;

import java.util.stream.Collectors;

import javax.validation.ConstraintViolationException;

import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.ControllerAdvice;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.context.request.WebRequest;
import org.springframework.web.servlet.mvc.method.annotation.ResponseEntityExceptionHandler;

@ControllerAdvice
public class CustomExceptionHandler extends ResponseEntityExceptionHandler {

	@ExceptionHandler(RecordNotFoundException.class)
	public final ResponseEntity<ErrorResponse> handleUserNotFoundException(RecordNotFoundException ex, WebRequest request) {
		return build(HttpStatus.NOT_FOUND, "Not Found", ex.getLocalizedMessage());
	}

	@ExceptionHandler(MissingHeaderInfoException.class)
	public final ResponseEntity<ErrorResponse> handleInvalidTraceIdException(MissingHeaderInfoException ex, WebRequest request) {
		return build(HttpStatus.BAD_REQUEST, "Bad Request", ex.getLocalizedMessage());
	}

	@ExceptionHandler(ConstraintViolationException.class)
	public final ResponseEntity<ErrorResponse> handleConstraintViolation(ConstraintViolationException ex, WebRequest request) {
		String message = ex.getConstraintViolations().parallelStream()
				.map(e -> e.getMessage())
				.collect(Collectors.joining(", "));
		return build(HttpStatus.BAD_REQUEST, "Bad Request", message);
	}

	@ExceptionHandler(CustomDataIntegrityViolationException.class)
	public final ResponseEntity<ErrorResponse> dataIntegrityViolationException(CustomDataIntegrityViolationException ex, WebRequest request) {
		return build(HttpStatus.CONFLICT, "Conflict", ex.getLocalizedMessage());
	}

	@ExceptionHandler(DataIntegrityViolationException.class)
	public final ResponseEntity<ErrorResponse> handleDataIntegrityViolation(DataIntegrityViolationException ex, WebRequest request) {
		return build(HttpStatus.CONFLICT, "Conflict", ex.getMostSpecificCause().getMessage());
	}

	@ExceptionHandler(Exception.class)
	public final ResponseEntity<ErrorResponse> handleUnexpected(Exception ex, WebRequest request) {
		return build(HttpStatus.INTERNAL_SERVER_ERROR, "Internal Server Error", "Unexpected server error");
	}

	private ResponseEntity<ErrorResponse> build(HttpStatus statusCode, String error, String message) {
		ErrorResponse errorResponse = new ErrorResponse("error", error, message);
		return new ResponseEntity<>(errorResponse, statusCode);
	}
}

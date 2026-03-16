package com.ahasan.rest.controller;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;

import com.ahasan.rest.common.CrudEntity;
import com.ahasan.rest.common.exceptions.RecordNotFoundException;

public abstract class AbstractCrudController<T extends CrudEntity> {

	private final JpaRepository<T, Integer> repository;
	private final String resourceName;

	protected AbstractCrudController(JpaRepository<T, Integer> repository, String resourceName) {
		this.repository = repository;
		this.resourceName = resourceName;
	}

	@GetMapping
	public ResponseEntity<List<T>> findAll() {
		return new ResponseEntity<List<T>>(repository.findAll(), HttpStatus.OK);
	}

	@GetMapping("/{id}")
	public ResponseEntity<T> findById(@PathVariable Integer id) {
		T entity = repository.findById(id)
				.orElseThrow(() -> new RecordNotFoundException(resourceName + " id " + id + " not found"));
		return new ResponseEntity<T>(entity, HttpStatus.OK);
	}

	@PostMapping
	public ResponseEntity<T> create(@RequestBody T entity) {
		entity.setId(null);
		return new ResponseEntity<T>(repository.save(entity), HttpStatus.CREATED);
	}

	@PutMapping("/{id}")
	public ResponseEntity<T> update(@PathVariable Integer id, @RequestBody T entity) {
		if (!repository.existsById(id)) {
			throw new RecordNotFoundException(resourceName + " id " + id + " not found");
		}
		entity.setId(id);
		return new ResponseEntity<T>(repository.save(entity), HttpStatus.OK);
	}

	@DeleteMapping("/{id}")
	public ResponseEntity<Void> delete(@PathVariable Integer id) {
		if (!repository.existsById(id)) {
			throw new RecordNotFoundException(resourceName + " id " + id + " not found");
		}
		repository.deleteById(id);
		return new ResponseEntity<Void>(HttpStatus.NO_CONTENT);
	}
}

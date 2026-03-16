package com.ahasan.rest.repo;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

import com.ahasan.rest.entity.SupplierEntity;

public interface SupplierRepo extends JpaRepository<SupplierEntity, Integer> {

	Page<SupplierEntity> findBySupplierNameContainingIgnoreCase(String supplierName, Pageable pageable);
}

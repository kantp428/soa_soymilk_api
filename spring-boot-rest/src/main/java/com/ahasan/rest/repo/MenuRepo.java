package com.ahasan.rest.repo;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

import com.ahasan.rest.entity.MenuEntity;

public interface MenuRepo extends JpaRepository<MenuEntity, Integer> {

	Page<MenuEntity> findByCategoryId(Integer categoryId, Pageable pageable);
}

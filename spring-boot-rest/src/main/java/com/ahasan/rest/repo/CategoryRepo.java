package com.ahasan.rest.repo;

import org.springframework.data.jpa.repository.JpaRepository;

import com.ahasan.rest.entity.CategoryEntity;

public interface CategoryRepo extends JpaRepository<CategoryEntity, Integer> {
}

package com.ahasan.rest.repo;

import org.springframework.data.jpa.repository.JpaRepository;

import com.ahasan.rest.entity.MenuEntity;

public interface MenuRepo extends JpaRepository<MenuEntity, Integer> {
}

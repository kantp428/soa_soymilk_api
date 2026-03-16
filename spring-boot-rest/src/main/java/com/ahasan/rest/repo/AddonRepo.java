package com.ahasan.rest.repo;

import org.springframework.data.jpa.repository.JpaRepository;

import com.ahasan.rest.entity.AddonEntity;

public interface AddonRepo extends JpaRepository<AddonEntity, Integer> {
}

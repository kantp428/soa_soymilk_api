package com.ahasan.rest.repo;

import org.springframework.data.jpa.repository.JpaRepository;

import com.ahasan.rest.entity.StaffEntity;

public interface StaffRepo extends JpaRepository<StaffEntity, Integer> {
}

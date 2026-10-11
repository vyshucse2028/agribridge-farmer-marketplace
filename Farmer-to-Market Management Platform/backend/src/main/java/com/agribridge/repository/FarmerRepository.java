package com.agribridge.repository;

import com.agribridge.entity.Farmer;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

/**
 * Repository for Farmer entity.
 */
@Repository
public interface FarmerRepository extends JpaRepository<Farmer, Long> {

    Optional<Farmer> findByUserId(Long userId);

    boolean existsByUserId(Long userId);

    List<Farmer> findByVerifiedTrue();
}

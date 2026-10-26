package com.agribridge.repository;

import com.agribridge.entity.Buyer;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

/**
 * Repository for Buyer entity.
 */
@Repository
public interface BuyerRepository extends JpaRepository<Buyer, Long> {

    Optional<Buyer> findByUserId(Long userId);

    boolean existsByUserId(Long userId);
}

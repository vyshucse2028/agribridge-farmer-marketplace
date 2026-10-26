package com.agribridge.repository;

import com.agribridge.entity.Review;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

/**
 * Repository for Review entity.
 */
@Repository
public interface ReviewRepository extends JpaRepository<Review, Long> {

    List<Review> findByCropId(Long cropId);

    List<Review> findByFarmerId(Long farmerId);

    List<Review> findByBuyerId(Long buyerId);
}

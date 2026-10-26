package com.agribridge.repository;

import com.agribridge.entity.Crop;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

/**
 * Repository for Crop entity.
 */
@Repository
public interface CropRepository extends JpaRepository<Crop, Long> {

    List<Crop> findByFarmerId(Long farmerId);

    List<Crop> findByAvailableTrue();

    List<Crop> findByCategoryId(Long categoryId);

    @Query("SELECT c FROM Crop c WHERE c.available = true AND " +
           "(LOWER(c.name) LIKE LOWER(CONCAT('%', :keyword, '%')) OR " +
           "LOWER(c.description) LIKE LOWER(CONCAT('%', :keyword, '%')))")
    List<Crop> searchCrops(@Param("keyword") String keyword);

    List<Crop> findByFarmerIdAndAvailableTrue(Long farmerId);
}

package com.agribridge.service;

import com.agribridge.dto.FarmerMapDto;
import com.agribridge.entity.Farmer;
import com.agribridge.exception.ResourceNotFoundException;
import com.agribridge.repository.FarmerRepository;
import com.agribridge.util.GeoUtils;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

/**
 * Business logic for Farmer profile operations.
 */
@Service
@RequiredArgsConstructor
public class FarmerService {

    private final FarmerRepository farmerRepository;

    public Farmer getFarmerProfile(Long userId) {
        return farmerRepository.findByUserId(userId)
                .orElseThrow(() -> new ResourceNotFoundException("Farmer profile not found for user " + userId));
    }

    public Farmer updateFarmerProfile(Long userId, Farmer updated) {
        Farmer farmer = getFarmerProfile(userId);
        farmer.setFarmName(updated.getFarmName());
        farmer.setFarmLocation(updated.getFarmLocation());
        farmer.setFarmSize(updated.getFarmSize());
        farmer.setDescription(updated.getDescription());
        farmer.setProfileImageUrl(updated.getProfileImageUrl());
        if (updated.getLatitude() != null && updated.getLongitude() != null) {
            farmer.setLatitude(updated.getLatitude());
            farmer.setLongitude(updated.getLongitude());
        } else {
            double[] coords = GeoUtils.resolve(updated.getFarmLocation(), farmer.getLatitude(), farmer.getLongitude());
            farmer.setLatitude(coords[0]);
            farmer.setLongitude(coords[1]);
        }
        return farmerRepository.save(farmer);
    }

    public List<FarmerMapDto> getAllVerifiedFarmersForMap() {
        return farmerRepository.findByVerifiedTrue().stream()
                .filter(farmer -> farmer.getLatitude() != null && farmer.getLongitude() != null)
                .map(farmer -> FarmerMapDto.builder()
                        .id(farmer.getId())
                        .farmName(farmer.getFarmName())
                        .farmLocation(farmer.getFarmLocation())
                        .latitude(farmer.getLatitude())
                        .longitude(farmer.getLongitude())
                        .profileImageUrl(farmer.getProfileImageUrl())
                        .verified(farmer.isVerified())
                        .build())
                .collect(Collectors.toList());
    }
}

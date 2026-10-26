package com.agribridge.service;

import com.agribridge.dto.CropRequest;
import com.agribridge.entity.*;
import com.agribridge.exception.BadRequestException;
import com.agribridge.exception.ResourceNotFoundException;
import com.agribridge.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

/**
 * Business logic for crop management (FARMER operations).
 */
@Service
@RequiredArgsConstructor
public class CropService {

    private final CropRepository cropRepository;
    private final FarmerRepository farmerRepository;
    private final CategoryRepository categoryRepository;

    public List<Crop> getAllAvailableCrops() {
        return cropRepository.findByAvailableTrue();
    }

    public List<Crop> getCropsByFarmer(Long userId) {
        Farmer farmer = farmerRepository.findByUserId(userId)
                .orElseThrow(() -> new ResourceNotFoundException("Farmer profile not found for user " + userId));
        return cropRepository.findByFarmerId(farmer.getId());
    }

    public List<Crop> searchCrops(String keyword) {
        return cropRepository.searchCrops(keyword);
    }

    public Crop getCropById(Long id) {
        return cropRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Crop", "id", id));
    }

    @Transactional
    public Crop addCrop(Long userId, CropRequest request) {
        Farmer farmer = farmerRepository.findByUserId(userId)
                .orElseThrow(() -> new ResourceNotFoundException("Farmer profile not found for user " + userId));

        Category category = null;
        if (request.getCategoryId() != null) {
            category = categoryRepository.findById(request.getCategoryId())
                    .orElseThrow(() -> new ResourceNotFoundException("Category", "id", request.getCategoryId()));
        }

        Crop crop = Crop.builder()
                .name(request.getName())
                .description(request.getDescription())
                .pricePerUnit(request.getPricePerUnit())
                .unit(request.getUnit())
                .availableQuantity(request.getAvailableQuantity())
                .available(request.isAvailable())
                .harvestDate(request.getHarvestDate())
                .imageUrl(request.getImageUrl())
                .farmer(farmer)
                .category(category)
                .build();

        return cropRepository.save(crop);
    }

    @Transactional
    public Crop updateCrop(Long cropId, Long userId, CropRequest request) {
        Crop crop = getCropById(cropId);
        if (!crop.getFarmer().getUser().getId().equals(userId)) {
            throw new BadRequestException("You are not authorized to update this crop");
        }

        crop.setName(request.getName());
        crop.setDescription(request.getDescription());
        crop.setPricePerUnit(request.getPricePerUnit());
        crop.setUnit(request.getUnit());
        crop.setAvailableQuantity(request.getAvailableQuantity());
        crop.setAvailable(request.isAvailable());
        crop.setHarvestDate(request.getHarvestDate());
        crop.setImageUrl(request.getImageUrl());

        return cropRepository.save(crop);
    }

    @Transactional
    public void deleteCrop(Long cropId, Long userId) {
        Crop crop = getCropById(cropId);
        if (!crop.getFarmer().getUser().getId().equals(userId)) {
            throw new BadRequestException("You are not authorized to delete this crop");
        }
        cropRepository.delete(crop);
    }
}

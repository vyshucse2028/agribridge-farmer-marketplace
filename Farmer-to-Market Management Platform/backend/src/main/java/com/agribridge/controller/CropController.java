package com.agribridge.controller;

import com.agribridge.dto.CropRequest;
import com.agribridge.entity.Crop;
import com.agribridge.service.CropService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;
import com.agribridge.entity.User;

import java.util.List;

/**
 * REST controller for crop CRUD and search.
 */
@RestController
@RequestMapping("/api/crops")
@RequiredArgsConstructor
@Tag(name = "Crops", description = "Crop listing management")
public class CropController {

    private final CropService cropService;

    @GetMapping
    @Operation(summary = "Get all available crops (public)")
    public ResponseEntity<List<Crop>> getAllCrops() {
        return ResponseEntity.ok(cropService.getAllAvailableCrops());
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get crop details by ID (public)")
    public ResponseEntity<Crop> getCropById(@PathVariable Long id) {
        return ResponseEntity.ok(cropService.getCropById(id));
    }

    @GetMapping("/search")
    @Operation(summary = "Search crops by keyword (public)")
    public ResponseEntity<List<Crop>> searchCrops(@RequestParam String keyword) {
        return ResponseEntity.ok(cropService.searchCrops(keyword));
    }

    @GetMapping("/my-crops")
    @SecurityRequirement(name = "bearerAuth")
    @Operation(summary = "Get farmer's own crops (FARMER only)")
    public ResponseEntity<List<Crop>> getMyCrops(@AuthenticationPrincipal UserDetails userDetails) {
        Long userId = ((User) userDetails).getId();
        return ResponseEntity.ok(cropService.getCropsByFarmer(userId));
    }

    @PostMapping("/add")
    @SecurityRequirement(name = "bearerAuth")
    @Operation(summary = "Add a new crop (FARMER only)")
    public ResponseEntity<Crop> addCrop(@AuthenticationPrincipal UserDetails userDetails,
                                        @Valid @RequestBody CropRequest request) {
        Long userId = ((User) userDetails).getId();
        return ResponseEntity.status(HttpStatus.CREATED).body(cropService.addCrop(userId, request));
    }

    @PutMapping("/update/{cropId}")
    @SecurityRequirement(name = "bearerAuth")
    @Operation(summary = "Update a crop (FARMER only, own crops)")
    public ResponseEntity<Crop> updateCrop(@AuthenticationPrincipal UserDetails userDetails,
                                           @PathVariable Long cropId,
                                           @Valid @RequestBody CropRequest request) {
        Long userId = ((User) userDetails).getId();
        return ResponseEntity.ok(cropService.updateCrop(cropId, userId, request));
    }

    @DeleteMapping("/delete/{cropId}")
    @SecurityRequirement(name = "bearerAuth")
    @Operation(summary = "Delete a crop (FARMER only, own crops)")
    public ResponseEntity<Void> deleteCrop(@AuthenticationPrincipal UserDetails userDetails,
                                           @PathVariable Long cropId) {
        Long userId = ((User) userDetails).getId();
        cropService.deleteCrop(cropId, userId);
        return ResponseEntity.noContent().build();
    }
}

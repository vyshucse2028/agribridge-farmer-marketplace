package com.agribridge.controller;

import com.agribridge.dto.FarmerMapDto;
import com.agribridge.entity.Farmer;
import com.agribridge.entity.User;
import com.agribridge.service.FarmerService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * REST controller for Farmer profile management.
 */
@RestController
@RequestMapping("/api/farmer")
@RequiredArgsConstructor
@SecurityRequirement(name = "bearerAuth")
@Tag(name = "Farmer", description = "Farmer profile management")
public class FarmerController {

    private final FarmerService farmerService;

    @GetMapping("/profile")
    @Operation(summary = "Get current farmer's profile")
    public ResponseEntity<Farmer> getProfile(@AuthenticationPrincipal UserDetails userDetails) {
        Long userId = ((User) userDetails).getId();
        return ResponseEntity.ok(farmerService.getFarmerProfile(userId));
    }

    @PutMapping("/profile")
    @Operation(summary = "Update current farmer's profile")
    public ResponseEntity<Farmer> updateProfile(@AuthenticationPrincipal UserDetails userDetails,
            @RequestBody Farmer updatedFarmer) {
        Long userId = ((User) userDetails).getId();
        return ResponseEntity.ok(farmerService.updateFarmerProfile(userId, updatedFarmer));
    }

    @GetMapping("/map")
    @Operation(summary = "Get all verified farmers with map locations (public)")
    public ResponseEntity<List<FarmerMapDto>> getFarmersForMap() {
        return ResponseEntity.ok(farmerService.getAllVerifiedFarmersForMap());
    }
}

package com.agribridge.controller;

import com.agribridge.entity.Buyer;
import com.agribridge.entity.User;
import com.agribridge.service.BuyerService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

/**
 * REST controller for Buyer profile management.
 */
@RestController
@RequestMapping("/api/buyer")
@RequiredArgsConstructor
@SecurityRequirement(name = "bearerAuth")
@Tag(name = "Buyer", description = "Buyer profile management")
public class BuyerController {

    private final BuyerService buyerService;

    @GetMapping("/profile")
    @Operation(summary = "Get current buyer's profile")
    public ResponseEntity<Buyer> getProfile(@AuthenticationPrincipal UserDetails userDetails) {
        Long userId = ((User) userDetails).getId();
        return ResponseEntity.ok(buyerService.getBuyerProfile(userId));
    }

    @PutMapping("/profile")
    @Operation(summary = "Update current buyer's profile")
    public ResponseEntity<Buyer> updateProfile(@AuthenticationPrincipal UserDetails userDetails,
                                               @RequestBody Buyer updatedBuyer) {
        Long userId = ((User) userDetails).getId();
        return ResponseEntity.ok(buyerService.updateBuyerProfile(userId, updatedBuyer));
    }
}

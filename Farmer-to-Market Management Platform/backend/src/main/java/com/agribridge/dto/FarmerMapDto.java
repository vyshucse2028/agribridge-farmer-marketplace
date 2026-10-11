package com.agribridge.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * DTO for farmer map location data.
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class FarmerMapDto {
    private Long id;
    private String farmName;
    private String farmLocation;
    private Double latitude;
    private Double longitude;
    private String profileImageUrl;
    private boolean verified;
}

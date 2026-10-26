package com.agribridge.dto;

import jakarta.validation.constraints.*;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDate;

/**
 * DTO for creating/updating a Crop listing.
 */
@Data
public class CropRequest {

    @NotBlank(message = "Crop name is required")
    private String name;

    private String description;

    @NotNull(message = "Price per unit is required")
    @DecimalMin(value = "0.01", message = "Price must be greater than 0")
    private BigDecimal pricePerUnit;

    @NotBlank(message = "Unit is required")
    private String unit;

    @NotNull(message = "Available quantity is required")
    @Min(value = 1, message = "Quantity must be at least 1")
    private Integer availableQuantity;

    private boolean available = true;

    private LocalDate harvestDate;

    private String imageUrl;

    private Long categoryId;
}

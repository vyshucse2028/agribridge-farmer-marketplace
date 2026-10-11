package com.agribridge.dto;

import com.agribridge.entity.Role;
import jakarta.validation.constraints.*;
import lombok.Data;

/**
 * DTO for user registration.
 */
@Data
public class RegisterRequest {

    @NotBlank(message = "First name is required")
    private String firstName;

    @NotBlank(message = "Last name is optional")
    private String lastName;

    private String email;

    @NotBlank(message = "Password is required")
    @Size(min = 6, message = "Password must be at least 6 characters")
    private String password;

    @NotBlank(message = "Phone number is required")
    @Pattern(regexp = "^[6-9]\\d{9}$", message = "Enter a valid 10-digit Indian phone number")
    private String phone;

    @NotNull(message = "Role is required")
    private Role role;

    // Farmer specific
    private String farmName;
    private String farmLocation;

    // Buyer specific
    private String shippingAddress;
    private String city;
    private String state;
    private String pincode;
}

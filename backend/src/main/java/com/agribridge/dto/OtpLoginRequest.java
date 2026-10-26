package com.agribridge.dto;

import com.agribridge.entity.Role;
import jakarta.validation.constraints.NotBlank;
import lombok.Data;

/**
 * DTO for logging in via OTP (SMS or WhatsApp).
 */
@Data
public class OtpLoginRequest {

    @NotBlank(message = "Phone number is required")
    private String phone;

    @NotBlank(message = "OTP code is required")
    private String otp;

    private String channel; // "SMS" or "WHATSAPP"

    private Role role; // Optional role for first-time OTP auto-provisioning
}

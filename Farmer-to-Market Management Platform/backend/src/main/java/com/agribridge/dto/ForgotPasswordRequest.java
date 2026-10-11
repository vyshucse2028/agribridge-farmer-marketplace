package com.agribridge.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Data;

/**
 * DTO for password reset using Phone and OTP.
 */
@Data
public class ForgotPasswordRequest {

    @NotBlank(message = "Phone number is required")
    private String phone;

    @NotBlank(message = "OTP code is required")
    private String otp;

    @NotBlank(message = "New password is required")
    @Size(min = 6, message = "Password must be at least 6 characters")
    private String newPassword;

    private String channel; // "SMS" or "WHATSAPP"
}

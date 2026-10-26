package com.agribridge.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

/**
 * DTO for requesting an OTP via SMS or WhatsApp.
 */
@Data
public class SendOtpRequest {

    @NotBlank(message = "Phone number is required")
    private String phone;

    private String channel; // "SMS" or "WHATSAPP"

    private String type; // "LOGIN" or "FORGOT_PASSWORD"
}

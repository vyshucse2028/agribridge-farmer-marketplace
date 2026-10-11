package com.agribridge.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

/**
 * DTO for login request using phone or email.
 */
@Data
public class LoginRequest {

    private String email;

    private String phone;

    @NotBlank(message = "Password is required")
    private String password;
}

package com.agribridge;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

/**
 * AgriBridge – Farmer-to-Market Management Platform
 * Main application entry point.
 */
@SpringBootApplication
public class AgriBridgeApplication {

    public static void main(String[] args) {
        SpringApplication.run(AgriBridgeApplication.class, args);
        System.out.println("🌾 AgriBridge Application started successfully!");
    }
}

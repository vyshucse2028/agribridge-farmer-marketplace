package com.agribridge.entity;

/**
 * Order status lifecycle for the AgriBridge platform.
 */
public enum OrderStatus {
    PENDING,        // Buyer placed order, waiting for farmer
    CONFIRMED,      // Farmer confirmed the order
    PROCESSING,     // Being prepared
    SHIPPED,        // Dispatched for delivery
    DELIVERED,      // Successfully delivered
    CANCELLED,      // Order cancelled
    COMPLETED       // Payment received and order closed
}

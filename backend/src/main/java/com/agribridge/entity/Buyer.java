package com.agribridge.entity;

import jakarta.persistence.*;
import lombok.*;

/**
 * Buyer profile linked one-to-one with User.
 */
@Entity
@Table(name = "buyers")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Buyer {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @com.fasterxml.jackson.annotation.JsonIgnoreProperties({"hibernateLazyInitializer", "handler", "password"})
    @OneToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "user_id", nullable = false, unique = true)
    private User user;

    private String shippingAddress;

    private String city;

    private String state;

    private String pincode;

    private Double latitude;

    private Double longitude;

    private String profileImageUrl;
}

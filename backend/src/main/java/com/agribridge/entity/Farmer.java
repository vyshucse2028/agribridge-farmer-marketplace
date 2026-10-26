package com.agribridge.entity;

import jakarta.persistence.*;
import lombok.*;

/**
 * Farmer profile linked one-to-one with User.
 */
@Entity
@Table(name = "farmers")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Farmer {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @com.fasterxml.jackson.annotation.JsonIgnoreProperties({"hibernateLazyInitializer", "handler", "password"})
    @OneToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "user_id", nullable = false, unique = true)
    private User user;

    @Column(nullable = false)
    private String farmName;

    private String farmLocation;

    private Double latitude;

    private Double longitude;

    private String farmSize;

    private String description;

    @Column(nullable = false)
    private boolean verified = false;

    private String profileImageUrl;
}

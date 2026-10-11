package com.agribridge.service;

import com.agribridge.entity.Buyer;
import com.agribridge.exception.ResourceNotFoundException;
import com.agribridge.repository.BuyerRepository;
import com.agribridge.util.GeoUtils;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

/**
 * Business logic for Buyer profile operations.
 */
@Service
@RequiredArgsConstructor
public class BuyerService {

    private final BuyerRepository buyerRepository;

    public Buyer getBuyerProfile(Long userId) {
        return buyerRepository.findByUserId(userId)
                .orElseThrow(() -> new ResourceNotFoundException("Buyer profile not found for user " + userId));
    }

    public Buyer updateBuyerProfile(Long userId, Buyer updated) {
        Buyer buyer = getBuyerProfile(userId);
        buyer.setShippingAddress(updated.getShippingAddress());
        buyer.setCity(updated.getCity());
        buyer.setState(updated.getState());
        buyer.setPincode(updated.getPincode());
        buyer.setProfileImageUrl(updated.getProfileImageUrl());
        if (updated.getLatitude() != null && updated.getLongitude() != null) {
            buyer.setLatitude(updated.getLatitude());
            buyer.setLongitude(updated.getLongitude());
        } else {
            double[] coords = GeoUtils.resolve(updated.getCity(), buyer.getLatitude(), buyer.getLongitude());
            buyer.setLatitude(coords[0]);
            buyer.setLongitude(coords[1]);
        }
        return buyerRepository.save(buyer);
    }
}

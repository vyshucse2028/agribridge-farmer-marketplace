package com.agribridge.service;

import com.agribridge.dto.OrderRequest;
import com.agribridge.entity.*;
import com.agribridge.exception.BadRequestException;
import com.agribridge.exception.ResourceNotFoundException;
import com.agribridge.repository.*;
import com.agribridge.util.GeoUtils;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

/**
 * Business logic for order lifecycle:
 * PENDING → CONFIRMED (Farmer) → SHIPPED → DELIVERED → COMPLETED
 */
@Service
@RequiredArgsConstructor
public class OrderService {

    private final OrderRepository orderRepository;
    private final BuyerRepository buyerRepository;
    private final CropRepository cropRepository;
    private final FarmerRepository farmerRepository;

    @Transactional
    public Order placeOrder(Long userId, OrderRequest request) {
        Buyer buyer = buyerRepository.findByUserId(userId)
                .orElseThrow(() -> new ResourceNotFoundException("Buyer profile not found"));

        List<OrderItem> items = new ArrayList<>();
        BigDecimal totalAmount = BigDecimal.ZERO;

        Order order = Order.builder()
                .orderNumber("ORD-" + UUID.randomUUID().toString().substring(0, 8).toUpperCase())
                .buyer(buyer)
                .status(OrderStatus.PENDING)
                .deliveryAddress(request.getDeliveryAddress())
                .deliveryCity(request.getDeliveryCity())
                .deliveryPincode(request.getDeliveryPincode())
                .notes(request.getNotes())
                .totalAmount(BigDecimal.ZERO)
                .build();

        for (OrderRequest.OrderItemRequest itemReq : request.getItems()) {
            Crop crop = cropRepository.findById(itemReq.getCropId())
                    .orElseThrow(() -> new ResourceNotFoundException("Crop", "id", itemReq.getCropId()));

            if (!crop.isAvailable() || crop.getAvailableQuantity() < itemReq.getQuantity()) {
                throw new BadRequestException("Insufficient quantity for crop: " + crop.getName());
            }

            BigDecimal subtotal = crop.getPricePerUnit()
                    .multiply(BigDecimal.valueOf(itemReq.getQuantity()));

            OrderItem item = OrderItem.builder()
                    .order(order)
                    .crop(crop)
                    .quantity(itemReq.getQuantity())
                    .unitPrice(crop.getPricePerUnit())
                    .subtotal(subtotal)
                    .build();
            items.add(item);
            totalAmount = totalAmount.add(subtotal);

            // Deduct quantity
            crop.setAvailableQuantity(crop.getAvailableQuantity() - itemReq.getQuantity());
            cropRepository.save(crop);
        }

        order.setTotalAmount(totalAmount);
        order.setItems(items);

        if (!items.isEmpty() && items.get(0).getCrop() != null && items.get(0).getCrop().getFarmer() != null) {
            Farmer farmer = items.get(0).getCrop().getFarmer();
            double[] origin = GeoUtils.resolve(farmer.getFarmLocation(), farmer.getLatitude(), farmer.getLongitude());
            order.setOriginLat(origin[0]);
            order.setOriginLng(origin[1]);
            order.setOriginLabel(farmer.getFarmName() != null
                    ? farmer.getFarmName() + (farmer.getFarmLocation() != null ? " · " + farmer.getFarmLocation() : "")
                    : farmer.getFarmLocation());
        }
        double[] dest = GeoUtils.resolve(
                (request.getDeliveryCity() != null ? request.getDeliveryCity() : "") + " " +
                        (request.getDeliveryAddress() != null ? request.getDeliveryAddress() : ""),
                buyer.getLatitude(),
                buyer.getLongitude());
        order.setDestLat(dest[0]);
        order.setDestLng(dest[1]);
        order.setDestLabel((request.getDeliveryAddress() != null ? request.getDeliveryAddress() : "")
                + (request.getDeliveryCity() != null ? ", " + request.getDeliveryCity() : "")
                + (request.getDeliveryPincode() != null ? " - " + request.getDeliveryPincode() : ""));

        // Create payment record
        Payment payment = Payment.builder()
                .order(order)
                .amount(totalAmount)
                .paymentMethod(request.getPaymentMethod())
                .paymentStatus("PENDING")
                .build();
        order.setPayment(payment);

        return orderRepository.save(order);
    }

    public List<Order> getBuyerOrders(Long userId) {
        Buyer buyer = buyerRepository.findByUserId(userId)
                .orElseThrow(() -> new ResourceNotFoundException("Buyer profile not found"));
        return orderRepository.findByBuyerId(buyer.getId());
    }

    public List<Order> getFarmerOrders(Long farmerOrUserId) {
        Farmer farmer = farmerRepository.findById(farmerOrUserId)
                .or(() -> farmerRepository.findByUserId(farmerOrUserId))
                .orElseThrow(() -> new ResourceNotFoundException("Farmer profile not found"));
        return orderRepository.findOrdersByFarmerId(farmer.getId());
    }

    public List<Order> getFarmerOrdersByUserId(Long userId) {
        Farmer farmer = farmerRepository.findByUserId(userId)
                .orElseThrow(() -> new ResourceNotFoundException("Farmer profile not found"));
        return orderRepository.findOrdersByFarmerId(farmer.getId());
    }

    public Order getOrderById(Long orderId) {
        return orderRepository.findById(orderId)
                .orElseThrow(() -> new ResourceNotFoundException("Order", "id", orderId));
    }

    @Transactional
    public Order updateOrderStatus(Long orderId, String newStatus, Long userId) {
        Order order = getOrderById(orderId);
        OrderStatus status;
        try {
            status = OrderStatus.valueOf(newStatus.toUpperCase());
        } catch (IllegalArgumentException e) {
            throw new BadRequestException("Invalid order status: " + newStatus);
        }
        order.setStatus(status);

        // Mark payment as success when order is completed
        if (status == OrderStatus.COMPLETED && order.getPayment() != null) {
            order.getPayment().setPaymentStatus("SUCCESS");
            order.getPayment().setPaidAt(LocalDateTime.now());
        }
        return orderRepository.save(order);
    }

    public List<Order> getAllOrders() {
        return orderRepository.findAll();
    }
}

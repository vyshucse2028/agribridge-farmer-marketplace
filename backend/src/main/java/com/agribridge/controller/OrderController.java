package com.agribridge.controller;

import com.agribridge.dto.OrderRequest;
import com.agribridge.entity.Order;
import com.agribridge.entity.User;
import com.agribridge.service.OrderService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

/**
 * REST controller for the Order lifecycle.
 */
@RestController
@RequestMapping("/api/orders")
@RequiredArgsConstructor
@SecurityRequirement(name = "bearerAuth")
@Tag(name = "Orders", description = "Order placement and lifecycle management")
public class OrderController {

    private final OrderService orderService;

    @PostMapping("/place")
    @Operation(summary = "Buyer places a new order")
    public ResponseEntity<Order> placeOrder(@AuthenticationPrincipal UserDetails userDetails,
                                            @Valid @RequestBody OrderRequest request) {
        Long userId = ((User) userDetails).getId();
        return ResponseEntity.status(HttpStatus.CREATED).body(orderService.placeOrder(userId, request));
    }

    @GetMapping("/my-orders")
    @Operation(summary = "Get buyer's own orders")
    public ResponseEntity<List<Order>> getMyOrders(@AuthenticationPrincipal UserDetails userDetails) {
        Long userId = ((User) userDetails).getId();
        return ResponseEntity.ok(orderService.getBuyerOrders(userId));
    }

    @GetMapping("/farmer-orders")
    @Operation(summary = "Get orders for the logged-in farmer")
    public ResponseEntity<List<Order>> getMyFarmerOrders(@AuthenticationPrincipal UserDetails userDetails) {
        Long userId = ((User) userDetails).getId();
        return ResponseEntity.ok(orderService.getFarmerOrdersByUserId(userId));
    }

    @GetMapping("/farmer-orders/{farmerId}")
    @Operation(summary = "Get all orders for a farmer's crops")
    public ResponseEntity<List<Order>> getFarmerOrders(@PathVariable Long farmerId) {
        return ResponseEntity.ok(orderService.getFarmerOrders(farmerId));
    }

    @GetMapping("/{orderId}")
    @Operation(summary = "Get order details by ID")
    public ResponseEntity<Order> getOrderById(@PathVariable Long orderId) {
        return ResponseEntity.ok(orderService.getOrderById(orderId));
    }

    @PutMapping("/{orderId}/status")
    @Operation(summary = "Update order status (Farmer confirms, ships, etc.)")
    public ResponseEntity<Order> updateStatus(@PathVariable Long orderId,
                                              @RequestBody Map<String, String> body,
                                              @AuthenticationPrincipal UserDetails userDetails) {
        Long userId = ((User) userDetails).getId();
        String newStatus = body.get("status");
        return ResponseEntity.ok(orderService.updateOrderStatus(orderId, newStatus, userId));
    }
}

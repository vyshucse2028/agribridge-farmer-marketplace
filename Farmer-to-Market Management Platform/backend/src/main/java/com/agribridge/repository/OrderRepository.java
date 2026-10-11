package com.agribridge.repository;

import com.agribridge.entity.Order;
import com.agribridge.entity.OrderStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

/**
 * Repository for Order entity.
 */
@Repository
public interface OrderRepository extends JpaRepository<Order, Long> {

    List<Order> findByBuyerId(Long buyerId);

    List<Order> findByStatus(OrderStatus status);

    Optional<Order> findByOrderNumber(String orderNumber);

    @Query("SELECT DISTINCT o FROM Order o JOIN o.items i JOIN i.crop c JOIN c.farmer f WHERE f.id = :farmerId")
    List<Order> findOrdersByFarmerId(@Param("farmerId") Long farmerId);

    @Query("SELECT DISTINCT o FROM Order o JOIN o.items i JOIN i.crop c JOIN c.farmer f " +
           "WHERE f.id = :farmerId AND o.status = :status")
    List<Order> findOrdersByFarmerIdAndStatus(@Param("farmerId") Long farmerId,
                                               @Param("status") OrderStatus status);
}

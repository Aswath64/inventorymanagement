package com.inventory.repository;

import com.inventory.entity.OrderItem;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface OrderItemRepository extends JpaRepository<OrderItem, Long> {
    List<OrderItem> findByOrderId(Long orderId);
    
    @Query("SELECT oi.product.id FROM OrderItem oi WHERE oi.order.user.id = :userId")
    List<Long> findPurchasedProductIdsByUserId(@Param("userId") Long userId);
}


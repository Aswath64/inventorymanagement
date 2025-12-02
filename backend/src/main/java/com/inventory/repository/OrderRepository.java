package com.inventory.repository;

import com.inventory.entity.Order;
import com.inventory.entity.User;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface OrderRepository extends JpaRepository<Order, Long> {
    List<Order> findByUser(User user);
    List<Order> findByStaff(User staff);
    
    @Query("SELECT o FROM Order o WHERE " +
           "(:userId IS NULL OR o.user.id = :userId) AND " +
           "(:status IS NULL OR o.status = :status) AND " +
           "(:startDate IS NULL OR o.createdAt >= :startDate) AND " +
           "(:endDate IS NULL OR o.createdAt <= :endDate)")
    Page<Order> findOrdersWithFilters(@Param("userId") Long userId,
                                       @Param("status") Order.OrderStatus status,
                                       @Param("startDate") LocalDateTime startDate,
                                       @Param("endDate") LocalDateTime endDate,
                                       Pageable pageable);
    
    @Query("SELECT COUNT(o) FROM Order o WHERE o.staff = :staff AND o.status = :status")
    long countByStaffAndStatus(User staff, Order.OrderStatus status);
    
    @Query("SELECT o FROM Order o WHERE o.staff = :staff AND DATE(o.createdAt) = CURRENT_DATE")
    List<Order> findTodayOrdersByStaff(User staff);
    
    @Query("SELECT SUM(o.totalAmount) FROM Order o WHERE " +
           "MONTH(o.createdAt) = :month AND YEAR(o.createdAt) = :year")
    java.math.BigDecimal getMonthlyRevenue(@Param("month") int month, @Param("year") int year);
}


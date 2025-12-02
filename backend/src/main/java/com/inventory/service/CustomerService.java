package com.inventory.service;

import com.inventory.dto.CustomerDashboardDto;
import com.inventory.dto.OrderDto;
import com.inventory.dto.ProfileDto;
import com.inventory.entity.Order;
import com.inventory.entity.User;
import com.inventory.repository.OrderRepository;
import com.inventory.repository.UserRepository;
import com.inventory.repository.WishlistRepository;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class CustomerService {
    
    private final UserRepository userRepository;
    private final OrderRepository orderRepository;
    private final WishlistRepository wishlistRepository;
    
    public CustomerService(UserRepository userRepository, OrderRepository orderRepository,
                          WishlistRepository wishlistRepository) {
        this.userRepository = userRepository;
        this.orderRepository = orderRepository;
        this.wishlistRepository = wishlistRepository;
    }
    
    private User getCurrentUser() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String email = authentication.getName();
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));
    }
    
    public CustomerDashboardDto getDashboard() {
        User user = getCurrentUser();
        
        long totalOrders = orderRepository.findByUser(user).size();
        List<Order> recentOrders = orderRepository.findByUser(user).stream()
                .sorted((a, b) -> b.getCreatedAt().compareTo(a.getCreatedAt()))
                .limit(5)
                .collect(Collectors.toList());
        
        long wishlistCount = wishlistRepository.countByUser(user);
        
        ProfileDto profile = toProfileDto(user);
        
        List<OrderDto> recentOrderDtos = recentOrders.stream()
                .map(this::toOrderDto)
                .collect(Collectors.toList());
        
        return new CustomerDashboardDto(totalOrders, recentOrderDtos, wishlistCount, profile);
    }
    
    private ProfileDto toProfileDto(User user) {
        return new ProfileDto(
                user.getId(),
                user.getEmail(),
                user.getName(),
                user.getPhone(),
                user.getAddress()
        );
    }
    
    private OrderDto toOrderDto(Order order) {
        return new OrderDto(
                order.getId(),
                order.getUser().getId(),
                order.getUser().getName(),
                order.getStaff() != null ? order.getStaff().getId() : null,
                order.getStaff() != null ? order.getStaff().getName() : null,
                order.getStatus(),
                order.getTotalAmount(),
                order.getShippingAddress(),
                order.getOrderItems().stream()
                        .map(item -> new com.inventory.dto.OrderItemDto(
                                item.getId(),
                                item.getProduct().getId(),
                                item.getProduct().getName(),
                                item.getQuantity(),
                                item.getPrice()
                        ))
                        .collect(Collectors.toList()),
                order.getCreatedAt(),
                order.getUpdatedAt()
        );
    }
}


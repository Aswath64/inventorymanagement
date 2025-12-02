package com.inventory.service;

import com.inventory.dto.AdminDashboardDto;
import com.inventory.dto.OrderDto;
import com.inventory.dto.ProductDto;
import com.inventory.dto.StaffDashboardDto;
import com.inventory.entity.Order;
import com.inventory.entity.Product;
import com.inventory.entity.User;
import com.inventory.repository.*;
import org.springframework.data.domain.PageRequest;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;

@Service
public class DashboardService {
    
    private final UserRepository userRepository;
    private final ProductRepository productRepository;
    private final OrderRepository orderRepository;
    private final CategoryRepository categoryRepository;
    
    public DashboardService(UserRepository userRepository, ProductRepository productRepository,
                           OrderRepository orderRepository, CategoryRepository categoryRepository) {
        this.userRepository = userRepository;
        this.productRepository = productRepository;
        this.orderRepository = orderRepository;
        this.categoryRepository = categoryRepository;
    }
    
    private User getCurrentUser() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String email = authentication.getName();
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));
    }
    
    public StaffDashboardDto getStaffDashboard() {
        User staff = getCurrentUser();
        
        long pendingOrdersCount = orderRepository.countByStaffAndStatus(staff, Order.OrderStatus.PENDING);
        long completedOrdersCount = orderRepository.countByStaffAndStatus(staff, Order.OrderStatus.DELIVERED);
        
        List<Order> todayOrders = orderRepository.findTodayOrdersByStaff(staff);
        List<OrderDto> todayOrderDtos = todayOrders.stream()
                .map(this::toOrderDto)
                .collect(Collectors.toList());
        
        return new StaffDashboardDto(pendingOrdersCount, completedOrdersCount, todayOrderDtos);
    }
    
    public AdminDashboardDto getAdminDashboard() {
        long totalProducts = productRepository.count();
        long totalCustomers = userRepository.countByRole(User.Role.CUSTOMER);
        long totalStaff = userRepository.countByRole(User.Role.STAFF);
        
        // Calculate total sales
        BigDecimal totalSales = orderRepository.findAll().stream()
                .filter(o -> o.getStatus() == Order.OrderStatus.DELIVERED)
                .map(Order::getTotalAmount)
                .reduce(BigDecimal.ZERO, BigDecimal::add);
        
        // Monthly revenue for last 12 months
        Map<String, BigDecimal> monthlyRevenue = new LinkedHashMap<>();
        LocalDateTime now = LocalDateTime.now();
        for (int i = 11; i >= 0; i--) {
            LocalDateTime monthStart = now.minusMonths(i).withDayOfMonth(1).withHour(0).withMinute(0).withSecond(0);
            int month = monthStart.getMonthValue();
            int year = monthStart.getYear();
            BigDecimal revenue = orderRepository.getMonthlyRevenue(month, year);
            if (revenue == null) revenue = BigDecimal.ZERO;
            monthlyRevenue.put(monthStart.getMonth().name() + " " + year, revenue);
        }
        
        // Low stock products
        List<Product> lowStockProducts = productRepository.findByStockLessThan(10);
        List<ProductDto> lowStockProductDtos = lowStockProducts.stream()
                .map(this::toProductDto)
                .limit(10)
                .collect(Collectors.toList());
        
        // Most sold products
        List<Product> mostSoldProducts = productRepository.findMostSoldProducts(PageRequest.of(0, 10)).getContent();
        List<ProductDto> mostSoldProductDtos = mostSoldProducts.stream()
                .map(this::toProductDto)
                .collect(Collectors.toList());
        
        // Category performance
        Map<String, Long> categoryPerformance = new HashMap<>();
        categoryRepository.findAll().forEach(category -> {
            long productCount = category.getProducts().size();
            categoryPerformance.put(category.getName(), productCount);
        });
        
        return new AdminDashboardDto(
                totalProducts,
                totalCustomers,
                totalStaff,
                totalSales,
                monthlyRevenue,
                lowStockProductDtos,
                mostSoldProductDtos,
                categoryPerformance
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
    
    private ProductDto toProductDto(Product product) {
        List<String> imageUrls = product.getImages().stream()
                .map(img -> img.getImageUrl())
                .collect(Collectors.toList());
        
        return new ProductDto(
                product.getId(),
                product.getName(),
                product.getDescription(),
                product.getPrice(),
                product.getStock(),
                null, null, product.getCategory().getId(),
                product.getCategory().getName(),
                imageUrls,
                null, // averageRating
                product.getReviews().size(),
                product.getCreatedAt(),
                product.getUpdatedAt()
        );
    }
}


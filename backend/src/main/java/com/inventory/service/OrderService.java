package com.inventory.service;

import com.inventory.dto.*;
import com.inventory.entity.*;
import com.inventory.repository.*;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class OrderService {
    
    private final OrderRepository orderRepository;
    private final OrderItemRepository orderItemRepository;
    private final CartRepository cartRepository;
    private final ProductRepository productRepository;
    private final UserRepository userRepository;
    private final NotificationRepository notificationRepository;
    private final EmailService emailService;
    private final NotificationService notificationService;
    
    public OrderService(OrderRepository orderRepository, OrderItemRepository orderItemRepository,
                       CartRepository cartRepository, ProductRepository productRepository,
                       UserRepository userRepository, NotificationRepository notificationRepository,
                       EmailService emailService, NotificationService notificationService) {
        this.orderRepository = orderRepository;
        this.orderItemRepository = orderItemRepository;
        this.cartRepository = cartRepository;
        this.productRepository = productRepository;
        this.userRepository = userRepository;
        this.notificationRepository = notificationRepository;
        this.emailService = emailService;
        this.notificationService = notificationService;
    }
    
    private User getCurrentUser() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String email = authentication.getName();
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));
    }
    
    @Transactional
    public OrderDto checkout(CheckoutRequest request) {
        User user = getCurrentUser();
        List<Cart> cartItems = cartRepository.findByUser(user);
        
        if (cartItems.isEmpty()) {
            throw new RuntimeException("Cart is empty");
        }
        
        // Create order
        Order order = new Order();
        order.setUser(user);
        order.setStatus(Order.OrderStatus.PENDING);
        order.setShippingAddress(request.getShippingAddress());
        order.setTotalAmount(BigDecimal.ZERO);
        
        order = orderRepository.save(order);
        
        BigDecimal totalAmount = BigDecimal.ZERO;
        
        // Create order items and calculate total
        for (Cart cartItem : cartItems) {
            Product product = cartItem.getProduct();
            
            if (product.getStock() < cartItem.getQuantity()) {
                throw new RuntimeException("Insufficient stock for product: " + product.getName());
            }
            
            OrderItem orderItem = new OrderItem();
            orderItem.setOrder(order);
            orderItem.setProduct(product);
            orderItem.setQuantity(cartItem.getQuantity());
            orderItem.setPrice(product.getPrice());
            
            orderItemRepository.save(orderItem);
            
            // Update product stock
            product.setStock(product.getStock() - cartItem.getQuantity());
            productRepository.save(product);
            
            // Check for low stock and notify admin/staff
            notificationService.checkAndNotifyLowStock(product);
            
            // Calculate subtotal
            BigDecimal subtotal = product.getPrice().multiply(BigDecimal.valueOf(cartItem.getQuantity()));
            totalAmount = totalAmount.add(subtotal);
        }
        
        order.setTotalAmount(totalAmount);
        order = orderRepository.save(order);
        
        // Clear cart
        cartRepository.deleteByUser(user);
        
        // Send email confirmation to customer
        emailService.sendOrderConfirmationEmail(user.getEmail(), order.getId().toString(), totalAmount.toString());
        
        // Create notification for staff
        List<User> staffUsers = userRepository.findAll().stream()
                .filter(u -> u.getRole() == User.Role.STAFF || u.getRole() == User.Role.ADMIN)
                .collect(Collectors.toList());
        
        for (User staff : staffUsers) {
            Notification notification = new Notification();
            notification.setUser(staff);
            notification.setMessage("New order #" + order.getId() + " placed by " + user.getName());
            notification.setType(Notification.NotificationType.ORDER_PLACED);
            notification.setIsRead(false);
            notificationRepository.save(notification);
            
            // Send email to staff
            emailService.sendOrderNotificationEmail(staff.getEmail(), order.getId().toString(), user.getName());
        }
        
        return toOrderDto(order);
    }
    
    public List<OrderDto> getCustomerOrders() {
        User user = getCurrentUser();
        List<Order> orders = orderRepository.findByUser(user);
        return orders.stream().map(this::toOrderDto).collect(Collectors.toList());
    }
    
    public OrderDto getOrderById(Long id) {
        Order order = orderRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Order not found"));
        return toOrderDto(order);
    }
    
    // Staff methods
    public List<OrderDto> getStaffOrders() {
        User staff = getCurrentUser();
        List<Order> orders = orderRepository.findByStaff(staff);
        return orders.stream().map(this::toOrderDto).collect(Collectors.toList());
    }
    
    @Transactional
    public OrderDto updateOrderStatus(Long orderId, UpdateOrderStatusRequest request) {
        User staff = getCurrentUser();
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new RuntimeException("Order not found"));
        
        // Check if order is assigned to this staff or if user is admin
        if (order.getStaff() != null && !order.getStaff().getId().equals(staff.getId()) 
            && staff.getRole() != User.Role.ADMIN) {
            throw new RuntimeException("Unauthorized: Order not assigned to you");
        }
        
        order.setStatus(request.getStatus());
        order = orderRepository.save(order);
        
        // Create notification for customer
        Notification notification = new Notification();
        notification.setUser(order.getUser());
        notification.setMessage("Your order #" + order.getId() + " status updated to " + request.getStatus());
        notification.setType(Notification.NotificationType.ORDER_UPDATED);
        notification.setIsRead(false);
        notificationRepository.save(notification);
        
        // Send email to customer about status update
        emailService.sendOrderStatusUpdateEmail(
                order.getUser().getEmail(),
                order.getId().toString(),
                request.getStatus().name()
        );
        
        return toOrderDto(order);
    }
    
    // Admin methods
    public Page<OrderDto> getAllOrders(Long userId, Order.OrderStatus status, 
                                      LocalDateTime startDate, LocalDateTime endDate, Pageable pageable) {
        return orderRepository.findOrdersWithFilters(userId, status, startDate, endDate, pageable)
                .map(this::toOrderDto);
    }
    
    @Transactional
    public OrderDto assignOrder(Long orderId, AssignOrderRequest request) {
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new RuntimeException("Order not found"));
        
        User staff = userRepository.findById(request.getStaffId())
                .orElseThrow(() -> new RuntimeException("Staff not found"));
        
        if (staff.getRole() != User.Role.STAFF && staff.getRole() != User.Role.ADMIN) {
            throw new RuntimeException("User is not a staff member");
        }
        
        order.setStaff(staff);
        order = orderRepository.save(order);
        
        // Create notification for staff
        Notification notification = new Notification();
        notification.setUser(staff);
        notification.setMessage("Order #" + order.getId() + " has been assigned to you");
        notification.setType(Notification.NotificationType.ORDER_PLACED);
        notification.setIsRead(false);
        notificationRepository.save(notification);
        
        return toOrderDto(order);
    }
    
    @Transactional
    public OrderDto cancelOrder(Long orderId) {
        User user = getCurrentUser();
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new RuntimeException("Order not found"));
        
        if (!order.getUser().getId().equals(user.getId())) {
            throw new RuntimeException("Unauthorized");
        }
        
        if (order.getStatus() != Order.OrderStatus.PENDING && order.getStatus() != Order.OrderStatus.PROCESSING) {
            throw new RuntimeException("Only pending/processing orders can be cancelled");
        }
        
        order.setStatus(Order.OrderStatus.CANCELLED);
        order = orderRepository.save(order);
        
        // Restock items
        for (OrderItem item : order.getOrderItems()) {
            Product product = item.getProduct();
            product.setStock(product.getStock() + item.getQuantity());
            productRepository.save(product);
        }
        
        // Notify staff/admin
        if (order.getStaff() != null) {
            Notification notification = new Notification();
            notification.setUser(order.getStaff());
            notification.setMessage("Order #" + order.getId() + " was cancelled by customer");
            notification.setType(Notification.NotificationType.ORDER_UPDATED);
            notification.setIsRead(false);
            notificationRepository.save(notification);
        } else {
            List<User> admins = userRepository.findByRole(User.Role.ADMIN);
            for (User admin : admins) {
                Notification notification = new Notification();
                notification.setUser(admin);
                notification.setMessage("Order #" + order.getId() + " was cancelled by customer");
                notification.setType(Notification.NotificationType.ORDER_UPDATED);
                notification.setIsRead(false);
                notificationRepository.save(notification);
            }
        }
        
        // Email customer
        emailService.sendOrderStatusUpdateEmail(
                order.getUser().getEmail(),
                order.getId().toString(),
                order.getStatus().name()
        );
        
        return toOrderDto(order);
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
                        .map(item -> new OrderItemDto(
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


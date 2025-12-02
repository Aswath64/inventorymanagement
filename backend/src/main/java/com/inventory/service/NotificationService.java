package com.inventory.service;

import com.inventory.dto.NotificationDto;
import com.inventory.entity.Notification;
import com.inventory.entity.Product;
import com.inventory.entity.User;
import com.inventory.repository.NotificationRepository;
import com.inventory.repository.ProductRepository;
import com.inventory.repository.UserRepository;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class NotificationService {
    
    private final NotificationRepository notificationRepository;
    private final UserRepository userRepository;
    private final ProductRepository productRepository;
    private final EmailService emailService;
    
    public NotificationService(NotificationRepository notificationRepository, UserRepository userRepository,
                              ProductRepository productRepository, EmailService emailService) {
        this.notificationRepository = notificationRepository;
        this.userRepository = userRepository;
        this.productRepository = productRepository;
        this.emailService = emailService;
    }
    
    private User getCurrentUser() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String email = authentication.getName();
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));
    }
    
    public List<NotificationDto> getUserNotifications() {
        User user = getCurrentUser();
        List<Notification> notifications = notificationRepository.findByUserOrderByCreatedAtDesc(user);
        return notifications.stream().map(this::toDto).collect(Collectors.toList());
    }
    
    public long getUnreadCount() {
        User user = getCurrentUser();
        return notificationRepository.countByUserAndIsReadFalse(user);
    }
    
    @Transactional
    public void markAsRead(Long notificationId) {
        User user = getCurrentUser();
        Notification notification = notificationRepository.findById(notificationId)
                .orElseThrow(() -> new RuntimeException("Notification not found"));
        
        if (!notification.getUser().getId().equals(user.getId())) {
            throw new RuntimeException("Unauthorized");
        }
        
        notification.setIsRead(true);
        notificationRepository.save(notification);
    }
    
    @Transactional
    public void markAllAsRead() {
        User user = getCurrentUser();
        List<Notification> unreadNotifications = notificationRepository.findByUserAndIsReadFalseOrderByCreatedAtDesc(user);
        for (Notification notification : unreadNotifications) {
            notification.setIsRead(true);
            notificationRepository.save(notification);
        }
    }
    
    @Scheduled(fixedRate = 3600000) // Run every hour
    @Transactional
    public void checkLowStock() {
        List<Product> lowStockProducts = productRepository.findByStockLessThan(10);
        
        if (!lowStockProducts.isEmpty()) {
            List<User> adminUsers = userRepository.findAll().stream()
                    .filter(u -> u.getRole() == User.Role.ADMIN)
                    .collect(Collectors.toList());
            
            for (User admin : adminUsers) {
                for (Product product : lowStockProducts) {
                    // Check if notification already exists
                    boolean notificationExists = notificationRepository.findByUserOrderByCreatedAtDesc(admin)
                            .stream()
                            .anyMatch(n -> n.getMessage().contains("Low stock") && 
                                         n.getMessage().contains(product.getName()) &&
                                         !n.getIsRead());
                    
                    if (!notificationExists) {
                        Notification notification = new Notification();
                        notification.setUser(admin);
                        notification.setMessage("Low stock alert: " + product.getName() + " has only " + product.getStock() + " units left");
                        notification.setType(Notification.NotificationType.LOW_STOCK);
                        notification.setIsRead(false);
                        notificationRepository.save(notification);
                        
                        // Send email alert
                        emailService.sendLowStockAlertEmail(admin.getEmail(), product.getName(), product.getStock());
                    }
                }
            }
        }
    }
    
    private NotificationDto toDto(Notification notification) {
        return new NotificationDto(
                notification.getId(),
                notification.getMessage(),
                notification.getIsRead(),
                notification.getType(),
                notification.getCreatedAt()
        );
    }
}


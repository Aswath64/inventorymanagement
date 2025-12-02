package com.inventory.dto;

import com.inventory.entity.Notification;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class NotificationDto {
    private Long id;
    private String message;
    private Boolean isRead;
    private Notification.NotificationType type;
    private LocalDateTime createdAt;
}


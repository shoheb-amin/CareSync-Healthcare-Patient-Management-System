package com.pms.notificationservice.dto;

import com.pms.notificationservice.entity.Notification;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.UUID;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class NotificationResponseDTO {
    private UUID id;
    private UUID recipientId;
    private Notification.RecipientType recipientType;
    private Notification.NotificationType notificationType;
    private Notification.NotificationChannel notificationChannel;
    private String message;
    private String subject;
    private Notification.NotificationStatus notificationStatus;
    private LocalDateTime sentAtTime;
    private LocalDateTime createdAt;

}

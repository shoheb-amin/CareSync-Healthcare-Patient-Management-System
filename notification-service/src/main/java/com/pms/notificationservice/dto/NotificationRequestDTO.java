package com.pms.notificationservice.dto;

import com.pms.notificationservice.entity.Notification;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.UUID;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class NotificationRequestDTO {
    @NotNull(message = "Recipient ID is required")
    private UUID recipientId;

    @NotNull(message = "Recipient type is required")
    private Notification.RecipientType recipientType;

    @NotNull(message = "Notification type is required")
    private Notification.NotificationType notificationType;

    @NotNull(message = "Notification channel is required")
    private Notification.NotificationChannel notificationChannel;

    @NotBlank(message = "Subject is required")
    private String subject;


    @NotBlank(message = "Message is required")
    private String message;
}

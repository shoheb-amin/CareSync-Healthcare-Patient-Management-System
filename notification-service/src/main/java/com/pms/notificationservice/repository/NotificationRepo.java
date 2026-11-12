package com.pms.notificationservice.repository;

import com.pms.notificationservice.entity.Notification;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.UUID;

public interface NotificationRepo extends JpaRepository<Notification, UUID> {
    boolean existsByRecipientIdAndNotificationTypeAndMessage(
            UUID recipientId,
            Notification.NotificationType notificationType,
            String message
    );

    boolean existsByRecipientIdAndNotificationTypeAndMessageContaining(
            UUID recipientId,
            Notification.NotificationType notificationType,
            String message
    );



}

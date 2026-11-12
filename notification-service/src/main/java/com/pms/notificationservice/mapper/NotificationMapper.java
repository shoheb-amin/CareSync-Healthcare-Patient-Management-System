package com.pms.notificationservice.mapper;

import com.pms.notificationservice.dto.NotificationResponseDTO;
import com.pms.notificationservice.entity.Notification;

public class NotificationMapper {
    public static NotificationResponseDTO toDTO(Notification notification) {
        NotificationResponseDTO notificationDTO = new NotificationResponseDTO();
        notificationDTO.setId(notification.getId());
        notificationDTO.setRecipientId(notification.getRecipientId());
        notificationDTO.setRecipientType(notification.getRecipientType());
        notificationDTO.setNotificationType(notification.getNotificationType());
        notificationDTO.setNotificationChannel(notification.getNotificationChannel());
        notificationDTO.setSubject(notification.getSubject());
        notificationDTO.setMessage(notification.getMessage());
        notificationDTO.setNotificationStatus(notification.getStatus());
        notificationDTO.setCreatedAt(notification.getCreatedAt());
        notificationDTO.setSentAtTime(notification.getSentAtTime());
        return notificationDTO;
    }
    public static Notification toEntity(NotificationResponseDTO notificationDTO) {
        Notification notification = new Notification();
        notification.setId(notificationDTO.getId());
        notification.setRecipientId(notificationDTO.getRecipientId());
        notification.setRecipientType(notificationDTO.getRecipientType());
        notification.setNotificationType(notificationDTO.getNotificationType());
        notification.setNotificationChannel(notificationDTO.getNotificationChannel());
        notification.setSubject(notificationDTO.getSubject());
        notification.setMessage(notificationDTO.getMessage());
        notification.setCreatedAt(notificationDTO.getCreatedAt());
        notification.setSentAtTime(notificationDTO.getSentAtTime());
        notification.setStatus(notificationDTO.getNotificationStatus());
        return notification;


    }
}

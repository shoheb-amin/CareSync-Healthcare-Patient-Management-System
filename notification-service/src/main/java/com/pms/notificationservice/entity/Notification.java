package com.pms.notificationservice.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.UUID;

@Data
@AllArgsConstructor
@NoArgsConstructor
@Entity
@Table(name = "notifications")
public class Notification {
    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    private UUID id;

    @Column(nullable = false)
    private UUID recipientId;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private RecipientType recipientType;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private NotificationType notificationType;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private  NotificationChannel notificationChannel;

    @Column(nullable = false, columnDefinition = "TEXT")
    private String subject;

    @Column(nullable = false, columnDefinition = "TEXT")
    private String message;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private NotificationStatus status;


    private LocalDateTime createdAt;


    private LocalDateTime sentAtTime;

    public enum RecipientType{
        PATIENT,DOCTOR
    }

    public enum NotificationType{
        APPOINTMENT_REMINDER,
        REGISTRATION_CONFIRMATION,
        PAYMENT_CONFIRMATION,
        APPOINTMENT_CONFIRMATION,
        General
    }

    public enum NotificationChannel{
        EMAIL,
        SMS,
        WHATSAPP,
    }

    public enum NotificationStatus{
        PENDING,
        SENT,
        FAILED,
    }




}

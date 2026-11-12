package com.pms.notificationservice.service;

import com.pms.notificationservice.entity.Notification;
import com.pms.notificationservice.provider.EmailProvider;
import com.pms.notificationservice.provider.SmsProvider;
import com.pms.notificationservice.provider.WhatsAppProvider;
import com.pms.notificationservice.repository.NotificationRepo;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;


@RequiredArgsConstructor
@Service
public class NotificationSenderService {

    private final NotificationRepo notificationRepo;
    private final EmailProvider emailProvider;
    private final SmsProvider smsProvider;
    private final WhatsAppProvider whatsAppProvider;

    public void sendNotification(Notification notification, String recipient){
        try{
            switch (notification.getNotificationChannel()){
                case EMAIL:
                    emailProvider.send(
                        recipient,
                        notification.getSubject(),
                        notification.getMessage()
                    );
                    break;
                case SMS:
                    smsProvider.send(
                            recipient,
                            notification.getMessage()
                    );
                    break;
                case WHATSAPP:
                    whatsAppProvider.send(
                            recipient,
                            notification.getMessage()
                    );
                    break;
                default:
                    throw new IllegalArgumentException(
                            "Invalid notification channel: "+
                                    notification.getNotificationChannel()
                    );
            }
            notification.setStatus(Notification.NotificationStatus.SENT);
            notification.setSentAtTime(LocalDateTime.now());
            notificationRepo.save(notification);
        } catch (Exception e){
            notification.setStatus(Notification.NotificationStatus.FAILED);
            notificationRepo.save(notification);
            throw new RuntimeException(
                    "Failed to send notification", e);
        }
    }

    public void sendTestEmail(
            String recipient,
            String subject,
            String message) {

        emailProvider.send(
                recipient,
                subject,
                message
        );
    }

}

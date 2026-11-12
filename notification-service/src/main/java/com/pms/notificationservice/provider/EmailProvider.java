package com.pms.notificationservice.provider;

public interface EmailProvider {
    void send(
            String recipient,
            String subject,
            String message
    );

}

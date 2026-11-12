package com.pms.notificationservice.provider;

public interface SmsProvider {
    void send(
            String recipient,
            String message
    );
}

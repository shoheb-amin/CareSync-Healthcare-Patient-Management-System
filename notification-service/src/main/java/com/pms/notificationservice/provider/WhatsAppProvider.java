package com.pms.notificationservice.provider;

public interface WhatsAppProvider {
    void send(
            String recipient,
            String message
    );
}

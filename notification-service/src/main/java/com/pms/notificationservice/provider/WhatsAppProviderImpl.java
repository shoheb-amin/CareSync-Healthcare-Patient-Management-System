package com.pms.notificationservice.provider;

import org.springframework.stereotype.Service;

@Service
public class WhatsAppProviderImpl implements WhatsAppProvider {

    @Override
    public void send(String recipient, String message) {

        System.out.println("Sending WhatsApp...");
        System.out.println("To: " + recipient);
        System.out.println("Message: " + message);
    }
}
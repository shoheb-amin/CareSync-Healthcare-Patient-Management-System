package com.pms.notificationservice.provider;

import org.springframework.stereotype.Service;

@Service
public class SmsProviderImpl implements SmsProvider {

    @Override
    public void send(String recipient, String message) {

        System.out.println("Sending SMS...");
        System.out.println("To: " + recipient);
        System.out.println("Message: " + message);
    }
}
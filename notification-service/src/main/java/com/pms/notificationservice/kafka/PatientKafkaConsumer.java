package com.pms.notificationservice.kafka;

import com.pms.notificationservice.service.NotificationService;
import lombok.RequiredArgsConstructor;
import org.springframework.kafka.annotation.KafkaListener;
import org.springframework.stereotype.Component;
import patient.events.PatientEvent;

@Component
@RequiredArgsConstructor
public class PatientKafkaConsumer {

    private final NotificationService notificationService;

    @KafkaListener(
            topics = "patient",
            groupId = "notification-service"
    )
    public void consumePatientEvent(byte[] event) {

        try {

            PatientEvent patientEvent =
                    PatientEvent.parseFrom(event);

            System.out.println("Received patient event:");
            System.out.println("Patient ID: " + patientEvent.getPatientId());
            System.out.println("Name: " + patientEvent.getName());
            System.out.println("Email: " + patientEvent.getEmail());
            System.out.println("Event Type: " + patientEvent.getEventType());

            notificationService.processPatientEvent(
                    patientEvent
            );

        } catch (Exception e) {

            System.out.println("Failed to process patient event");
            e.printStackTrace();
        }
    }
}
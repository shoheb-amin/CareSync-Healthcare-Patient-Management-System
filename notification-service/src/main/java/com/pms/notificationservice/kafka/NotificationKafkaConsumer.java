package com.pms.notificationservice.kafka;

import appointment.events.AppointmentEvent;
import com.google.protobuf.InvalidProtocolBufferException;
import com.pms.notificationservice.service.NotificationService;
import lombok.RequiredArgsConstructor;
import org.springframework.kafka.annotation.KafkaListener;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
public class NotificationKafkaConsumer {
    private final NotificationService notificationService;

    @KafkaListener(
            topics = "appointment",
            groupId = "notification-service"
    )
    public void consumeAppointmentEvent(byte[] event) {

        try {
            AppointmentEvent appointmentEvent =
                    AppointmentEvent.parseFrom(event);

            System.out.println("Received appointment event:");
            System.out.println("Appointment ID: " + appointmentEvent.getAppointmentId());
            System.out.println("Patient ID: " + appointmentEvent.getPatientId());
            System.out.println("Doctor ID: " + appointmentEvent.getDoctorId());
            System.out.println("Appointment Date: " + appointmentEvent.getAppointmentDate());
            System.out.println("Appointment Time: " + appointmentEvent.getAppointmentTime());
            System.out.println("Reason: " + appointmentEvent.getReason());
            System.out.println("Doctor Name: " + appointmentEvent.getDoctorName());
            System.out.println("Status: " + appointmentEvent.getStatus());

            //send event ot notification service
            notificationService.processAppointmentEvent(appointmentEvent);

        } catch (InvalidProtocolBufferException e) {
            System.out.println("Failed to parse appointment event");
            e.printStackTrace();
        }
    }
}
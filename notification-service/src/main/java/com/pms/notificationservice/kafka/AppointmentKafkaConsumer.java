package com.pms.notificationservice.kafka;

import appointment.events.AppointmentEvent;
import com.pms.notificationservice.service.NotificationService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.kafka.annotation.KafkaListener;
import org.springframework.stereotype.Component;
@Slf4j
@Component
@RequiredArgsConstructor
public class AppointmentKafkaConsumer {
    private final NotificationService notificationService;

    @KafkaListener(
            topics = "appointment",
            groupId = "notification-service"
    )
    public void consumeAppointmentEvent(byte[] event){

        try {
            AppointmentEvent appointmentEvent =
                    AppointmentEvent.parseFrom(event);

            System.out.println("Received appointment event:");
            System.out.println("Appointment Id: " + appointmentEvent.getAppointmentId());
            System.out.println("Patient Id: " + appointmentEvent.getPatientId());
            System.out.println("Doctor Id: " + appointmentEvent.getDoctorId());
            System.out.println("Doctor Name: " + appointmentEvent.getDoctorName());
            System.out.println("Appointment Date: " + appointmentEvent.getAppointmentDate());
            System.out.println("Appointment Time: " + appointmentEvent.getAppointmentTime());
            System.out.println("Status: " + appointmentEvent.getStatus());

            notificationService.processAppointmentEvent(appointmentEvent);
            log.info(
                    "Appointment event processed successfully. Appointment Id: "
                            + appointmentEvent.getAppointmentId()
            );
        }catch (Exception e){
            System.out.println("Faild to process appointment event");
            e.printStackTrace();
        }
    }
}

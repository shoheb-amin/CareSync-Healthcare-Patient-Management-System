package com.pms.appointmentservice.kafka;

import appointment.events.AppointmentEvent;
import com.pms.appointmentservice.entity.Appointment;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.stereotype.Service;

@Slf4j
@Service
@RequiredArgsConstructor
public class AppointmentKafkaProducer {

    private final KafkaTemplate<String, byte[]> kafkaTemplate;

    public void sendEvent(Appointment appointment, String status) {

        if (appointment.getDoctorName() == null
                || appointment.getDoctorName().isBlank()) {
            throw new IllegalArgumentException(
                    "Doctor name is missing for appointment: " + appointment.getId()
            );
        }

        AppointmentEvent event = AppointmentEvent.newBuilder()
                .setAppointmentId(appointment.getId().toString())
                .setPatientId(appointment.getPatientId().toString())
                .setReason(appointment.getReason())
                .setAppointmentDate(appointment.getAppointmentDate().toString())
                .setAppointmentTime(appointment.getAppointmentTime().toString())
                .setDoctorId(appointment.getDoctorId().toString())
                .setDoctorName(appointment.getDoctorName())
                .setStatus(status)
                .build();

        try {
            kafkaTemplate.send(
                    "appointment",
                    appointment.getId().toString(),
                    event.toByteArray()
            ).whenComplete((result, exception) -> {

                if (exception != null) {
                    log.error(
                            "Failed to publish appointment event for appointment ID {}",
                            appointment.getId(),
                            exception
                    );
                } else {
                    log.info(
                            "Published appointment event: appointmentId={}, status={}, topic={}, partition={}, offset={}",
                            appointment.getId(),
                            status,
                            result.getRecordMetadata().topic(),
                            result.getRecordMetadata().partition(),
                            result.getRecordMetadata().offset()
                    );
                }
            });

        } catch (Exception e) {
            log.error(
                    "Failed to initiate appointment event publishing for appointment ID {}",
                    appointment.getId(),
                    e
            );

            throw e;
        }
    }

}

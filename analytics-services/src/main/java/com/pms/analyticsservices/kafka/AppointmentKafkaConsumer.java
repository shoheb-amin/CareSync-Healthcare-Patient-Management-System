package com.pms.analyticsservices.kafka;

import appointment.events.AppointmentEvent;

import com.google.protobuf.InvalidProtocolBufferException;

import com.pms.analyticsservices.entity.AppointmentAnalytics;
import com.pms.analyticsservices.repository.AppointmentAnalyticsRepo;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

import org.springframework.kafka.annotation.KafkaListener;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;

@Slf4j
@Service
@RequiredArgsConstructor
public class AppointmentKafkaConsumer {

    private final AppointmentAnalyticsRepo appointmentAnalyticsRepo;

    @KafkaListener(
            topics = "appointment",
            groupId = "analytics-services"
    )
    @Transactional
    public void consumeAppointmentEvent(byte[] event) {

        try {

            // Deserialize Protobuf event
            AppointmentEvent appointmentEvent = AppointmentEvent.parseFrom(event);

            String appointmentId = appointmentEvent.getAppointmentId();

            log.info(
                    "Received appointment event: appointmentId={}, status={}",
                    appointmentId,
                    appointmentEvent.getStatus());

            //Find existing appointment or create new one
            AppointmentAnalytics analytics = appointmentAnalyticsRepo.findById(appointmentId)
                            .orElseGet(AppointmentAnalytics::new);

            //Map event data to entity
            analytics.setAppointmentId(appointmentId);
            analytics.setPatientId(appointmentEvent.getPatientId());
            analytics.setDoctorId(appointmentEvent.getDoctorId());
            analytics.setDoctorName(appointmentEvent.getDoctorName());
            analytics.setAppointmentDate(LocalDate.parse(appointmentEvent.getAppointmentDate()));
            analytics.setAppointmentTime(LocalTime.parse(appointmentEvent.getAppointmentTime()));
            analytics.setReason(appointmentEvent.getReason());
            analytics.setStatus(appointmentEvent.getStatus());
            analytics.setReceivedAt(LocalDateTime.now());
            appointmentAnalyticsRepo.save(analytics);

            log.info(
                    "Appointment analytics saved successfully: appointmentId={}, status={}",
                    appointmentId,
                    appointmentEvent.getStatus()
            );
        } catch (InvalidProtocolBufferException e) {
            log.error("Failed to deserialize appointment event", e);
            throw new IllegalArgumentException(
                    "Invalid appointment Protobuf event", e);
        }

    }
}
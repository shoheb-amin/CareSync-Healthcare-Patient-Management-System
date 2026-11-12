package com.pms.analyticsservices.kafka;

import doctor.events.DoctorEvent;

import com.google.protobuf.InvalidProtocolBufferException;

import com.pms.analyticsservices.entity.DoctorAnalytics;
import com.pms.analyticsservices.repository.DoctorAnalyticsRepo;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

import org.springframework.kafka.annotation.KafkaListener;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;

@Slf4j
@Service
@RequiredArgsConstructor
public class DoctorKafkaConsumer {

    private final DoctorAnalyticsRepo doctorAnalyticsRepo;
    @KafkaListener(
            topics = "doctor",
            groupId = "analytics-services"
    )
    @Transactional
    public void consumeDoctorEvent(byte[] event) {
        try {
            //Deserialize Protobuf event
            DoctorEvent doctorEvent = DoctorEvent.parseFrom(event);
            String doctorId = doctorEvent.getId();
            log.info("Received doctor event: doctorId={}, name={}, status={}",
                    doctorId,
                    doctorEvent.getDoctorName(),
                    doctorEvent.getStatus());
            //Find existing doctor or create new
            DoctorAnalytics analytics = doctorAnalyticsRepo.findById(doctorId)
                            .orElseGet(DoctorAnalytics::new);
            //Map event data
            analytics.setDoctorId(doctorId);
            analytics.setDoctorName(doctorEvent.getDoctorName());
            analytics.setDoctorEmail(doctorEvent.getDoctorEmail());
            analytics.setDoctorPhone(doctorEvent.getDoctorPhone());
            analytics.setDoctorAddress(doctorEvent.getDoctorAddress());
            analytics.setCity(doctorEvent.getCity());
            analytics.setState(doctorEvent.getState());
            analytics.setZipcode(doctorEvent.getZipcode());
            analytics.setSpeciality(doctorEvent.getSpeciality());
            analytics.setDepartment(doctorEvent.getDepartment());
            analytics.setQualification(doctorEvent.getQualification());
            analytics.setGender(doctorEvent.getGender());
            analytics.setStatus(doctorEvent.getStatus());
            analytics.setReceivedAt(LocalDateTime.now());
            doctorAnalyticsRepo.save(analytics);

            log.info("Doctor analytics saved successfully: doctorId={}", doctorId);
        } catch (InvalidProtocolBufferException e) {
            log.error("Failed to deserialize doctor event", e);
            throw new IllegalArgumentException(
                    "Invalid doctor Protobuf event", e
            );
        }
    }
}
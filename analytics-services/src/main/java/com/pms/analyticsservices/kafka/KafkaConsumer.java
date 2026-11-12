package com.pms.analyticsservices.kafka;

import com.google.protobuf.InvalidProtocolBufferException;
import com.pms.analyticsservices.entity.PatientAnalytics;
import com.pms.analyticsservices.repository.PatientAnalyticsRepo;
import jakarta.annotation.PostConstruct;
import lombok.extern.slf4j.Slf4j;
import org.springframework.kafka.annotation.KafkaListener;
import org.springframework.stereotype.Service;
import patient.events.PatientEvent;

import java.time.LocalDateTime;

@Slf4j
@Service
public class KafkaConsumer {
    private final PatientAnalyticsRepo patientAnalyticsRepo;

    public KafkaConsumer(PatientAnalyticsRepo patientAnalyticsRepo) {
        this.patientAnalyticsRepo = patientAnalyticsRepo;
    }

    @PostConstruct
    public void init() {
        log.info("========== KafkaConsumer BEAN CREATED ==========");
    }

    @KafkaListener(
            topics = "patient",
            groupId = "analytics-services"
    )
    public void consumeEvent(byte[] event){
        try {
            PatientEvent patientEvent = PatientEvent.parseFrom(event);
            //...perform any business related to analytics here
            String patientId = patientEvent.getPatientId();

            log.info("Received patient event: [PatientID={},PatientName={}, " +
                    "PatientEmail={} ]",
                    patientId,
                    patientEvent.getName(),
                    patientEvent.getEmail());
            //check duplicate patient
            if(patientAnalyticsRepo.existsById(patientId)){
                log.info("Patient with id: [{}] already exists", patientId);
                return;
            }
            //create analytics entity
            PatientAnalytics patientAnalytics = new PatientAnalytics();
            patientAnalytics.setPatientId(patientId);
            patientAnalytics.setName(patientEvent.getName());
            patientAnalytics.setEmail(patientEvent.getEmail());
            patientAnalytics.setEventType(patientEvent.getEventType());
            patientAnalytics.setReceivedAt(LocalDateTime.now());
            patientAnalyticsRepo.save(patientAnalytics);
            log.info("Patient with id: [{}] has been saved", patientId);
        } catch (InvalidProtocolBufferException e) {
            log.error("Error deserializing event {}", e.getMessage());
        }

    }
}

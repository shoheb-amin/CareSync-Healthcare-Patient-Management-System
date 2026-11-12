package com.pms.patientservice.kafka;

import com.pms.patientservice.model.Patient;
import lombok.extern.slf4j.Slf4j;
import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.stereotype.Service;
import patient.events.PatientEvent;

@Slf4j
@Service
public class KafkaProducer {

    private final KafkaTemplate<String, byte[]> kafkaTemplate;

    public KafkaProducer(KafkaTemplate<String, byte[]> kafkaTemplate) {
        this.kafkaTemplate = kafkaTemplate;
    }

    public void sendEvent(Patient patient) {

        PatientEvent event = PatientEvent.newBuilder()
                .setPatientId(patient.getId().toString())
                .setName(patient.getName())
                .setEmail(patient.getEmail())
                .setEventType("PATIENT_CREATED")
                .build();

        log.info("Publishing patient event: {}", patient.getId());

        try {
            kafkaTemplate.send(
                    "patient",
                    patient.getId().toString(),
                    event.toByteArray()
            ).whenComplete((result, exception) -> {

                if (exception != null) {
                    log.error("Failed to publish patient event: {}",
                            patient.getId(), exception);
                } else {
                    log.info(
                            "Patient event published successfully. Topic={}, Partition={}, Offset={}",
                            result.getRecordMetadata().topic(),
                            result.getRecordMetadata().partition(),
                            result.getRecordMetadata().offset()
                    );
                }
            });

        } catch (Exception e) {
            log.error("Error initiating patient event publishing", e);
        }
    }


}

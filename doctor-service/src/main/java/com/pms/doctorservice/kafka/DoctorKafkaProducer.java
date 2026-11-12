package com.pms.doctorservice.kafka;

import com.pms.doctorservice.entity.Doctor;

import doctor.events.DoctorEvent;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.stereotype.Service;

@Service
@Slf4j
@RequiredArgsConstructor
public class DoctorKafkaProducer {
    private final KafkaTemplate<String, byte[]> kafkaTemplate;
//    public DoctorKafkaProducer(KafkaTemplate<String, byte[]> kafkaTemplate) {
//        this.kafkaTemplate = kafkaTemplate;
//    }

    public void sendEvent(Doctor doctor) {
        DoctorEvent event = DoctorEvent.newBuilder()
                .setId(doctor.getId().toString())
                .setDoctorName(doctor.getDoctorName())
                .setDoctorEmail(doctor.getDoctorEmail())
                .setDoctorPhone(doctor.getDoctorPhone())
                .setDoctorAddress(doctor.getDoctorAddress())
                .setCity(doctor.getCity())
                .setState(doctor.getState())
                .setGender(doctor.getGender().toString())
                .setSpeciality(doctor.getSpeciality())
                .setDepartment(doctor.getDepartment())
                .setStatus("DOCTOR_CREATED")
                .build();

        try {
            kafkaTemplate.send("doctor", event.toByteArray());
        } catch (Exception e) {
            log.error("Error sending DoctorCreated event: {}", event);
        }





    }


}

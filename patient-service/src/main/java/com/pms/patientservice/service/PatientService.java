package com.pms.patientservice.service;

import billing.BillingResponse;
import com.pms.patientservice.dto.PatientRequestDTO;
import com.pms.patientservice.dto.PatientResponseDTO;
import com.pms.patientservice.exception.EmailAlreadyExistsExistsException;
import com.pms.patientservice.exception.PatientNotFoundException;
import com.pms.patientservice.grpc.BillingServiceGrpcClient;
import com.pms.patientservice.kafka.KafkaProducer;
import com.pms.patientservice.mapper.PatientMapper;
import com.pms.patientservice.model.Patient;
import com.pms.patientservice.repository.PatientRepo;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

@Slf4j
@Service
public class PatientService {

    @Autowired
    private PatientRepo patientRepo;

    @Autowired
    private BillingServiceGrpcClient billingServiceGrpcClient;

    @Autowired
    private KafkaProducer kafkaProducer;

    public List<PatientResponseDTO> getPatients(){
        List<Patient> patients=patientRepo.findAll();
        return patients.stream()
                .map(PatientMapper::toDTO).toList();
    }

    public PatientResponseDTO createPatient(PatientRequestDTO patientRequestDTO){
        if(patientRepo.existsByEmail(patientRequestDTO.getEmail())){
            throw new EmailAlreadyExistsExistsException("A patient with this " +
                    "email already exists"+patientRequestDTO.getEmail());
        }

        //save method is inbuilt method provided by JPA
        Patient newPatient=patientRepo.save(
                PatientMapper.toModel(patientRequestDTO));

        //kafka producer
        kafkaProducer.sendEvent(newPatient);

        log.info(">>> Patient saved:{}",newPatient.getId());
        log.info(">>> Calling Billing Service via gRPC...");


        //creating a billing account with patient creation
        BillingResponse billingResponse=billingServiceGrpcClient.createBillingAccount(newPatient.getId()
                .toString(),newPatient.getName(), newPatient.getEmail());

        log.info("<<< Billing response: {}", billingResponse);
        // an email address must be unique
        return PatientMapper.toDTO(newPatient);
    }

    //update Patient
    public PatientResponseDTO updatePatient(UUID id, PatientRequestDTO patientRequestDTO){
        Patient patient=patientRepo.findById(id).orElseThrow(()->new
                PatientNotFoundException("Patient not found with id: "+id));

        if(patientRepo.existsByEmailAndIdNot(patientRequestDTO.getEmail(),id)){
            throw new EmailAlreadyExistsExistsException("A patient with this email " +
                    "already exists" +patientRequestDTO.getEmail());

        }
        patient.setName(patientRequestDTO.getName());
        patient.setAddress(patientRequestDTO.getAddress());
        patient.setEmail(patientRequestDTO.getEmail());
        patient.setBirthdate(LocalDate.parse(patientRequestDTO.getDateOfBirth()));
        patient.setGender(patientRequestDTO.getGender());
        Patient updatedPatient=patientRepo.save(patient);
        return PatientMapper.toDTO(updatedPatient);
    }

    public void deletePatient(UUID id){
        patientRepo.deleteById(id);
    }

}

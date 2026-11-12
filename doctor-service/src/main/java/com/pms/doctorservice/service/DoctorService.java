package com.pms.doctorservice.service;

import com.pms.doctorservice.dto.DoctorRequestDTO;
import com.pms.doctorservice.dto.DoctorResponseDTO;
import com.pms.doctorservice.entity.Doctor;
import com.pms.doctorservice.exception.DoctorNotFoundException;
import com.pms.doctorservice.exception.EmailAlreadyExistsException;
import com.pms.doctorservice.kafka.DoctorKafkaProducer;
import com.pms.doctorservice.mapper.DoctorMapper;
import com.pms.doctorservice.repository.DoctorRepo;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.UUID;

@Service
@Slf4j
@RequiredArgsConstructor
public class DoctorService {
    private final DoctorRepo doctorRepo;

    private final DoctorKafkaProducer doctorKafkaProducer;

    public List<DoctorResponseDTO> getDoctors(){
        List<Doctor> doctors = doctorRepo.findAll();
        return doctors.stream()
                .map(DoctorMapper::toDTO).toList();
    }

    //create doctor
    public DoctorResponseDTO createDoctor(DoctorRequestDTO doctorRequestDTO){
        if (doctorRepo.existsByDoctorEmail(doctorRequestDTO.getDoctorEmail())) {
            throw new EmailAlreadyExistsException
                    ("A doctor with this email is already exists!"+doctorRequestDTO.getDoctorEmail());
        }
        //save method is inbuilt method provided by JPA
        Doctor newDoctor = doctorRepo.save(
                DoctorMapper.toEntity(doctorRequestDTO)
        );

        //kafkaProducer
        doctorKafkaProducer.sendEvent(newDoctor);

        log.info(">>> Doctor saved:{}",newDoctor.getId());
        return DoctorMapper.toDTO(newDoctor);

    }

    //update doctor
    public DoctorResponseDTO updateDoctor(UUID id, DoctorRequestDTO doctorRequestDTO){
        Doctor doctor = doctorRepo
                .findById(id)
                .orElseThrow(()->
                        new DoctorNotFoundException
                                ("Doctor not found with this id: "+id));

        if(doctorRepo.existsByDoctorEmailAndIdNot(doctorRequestDTO.getDoctorEmail(),id)){
            throw new EmailAlreadyExistsException("A Doctor with this email is already exists "
                    +doctorRequestDTO.getDoctorEmail());
        }
        doctor.setDoctorName(doctorRequestDTO.getDoctorName());
        doctor.setDoctorEmail(doctorRequestDTO.getDoctorEmail());
        doctor.setDoctorPhone(doctorRequestDTO.getDoctorPhone());
        doctor.setDoctorAddress(doctorRequestDTO.getDoctorAddress());
        doctor.setDoctorAddress(doctorRequestDTO.getDoctorAddress());
        doctor.setCity(doctorRequestDTO.getCity());
        doctor.setState(doctorRequestDTO.getState());
        doctor.setZipCode(doctorRequestDTO.getZipCode());
        doctor.setGender(doctorRequestDTO.getGender());
        doctor.setSpeciality(doctorRequestDTO.getSpeciality());
        doctor.setDepartment(doctorRequestDTO.getDepartment());
        doctor.setQualification(doctorRequestDTO.getQualification());
        Doctor updatedDoctor = doctorRepo.save(doctor);
        return DoctorMapper.toDTO((updatedDoctor));
    }

    //delete Doctor
    public void deleteDoctor(UUID id){
        doctorRepo.deleteById(id);
    }

}

package com.pms.doctorservice.repository;

import com.pms.doctorservice.entity.Doctor;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.UUID;

public interface DoctorRepo extends JpaRepository<Doctor, UUID> {
    boolean existsById(UUID id);
    boolean existsByDoctorEmail(String doctorEmail);
    boolean existsByDoctorEmailAndIdNot(String doctorEmail, UUID id);


}

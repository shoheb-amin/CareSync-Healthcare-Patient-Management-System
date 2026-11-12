package com.pms.appointmentservice.appointmentRepo;

import com.pms.appointmentservice.entity.DoctorAvailability;
import org.springframework.data.jpa.repository.JpaRepository;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface DoctorAvailabilityRepo extends JpaRepository<DoctorAvailability, UUID> {
    List<DoctorAvailability> findByDoctorIdAndDoctorAvailabilityDate(
            UUID doctorId,
            LocalDate doctorAvailabilityDate
    );

    List<DoctorAvailability> findByDepartmentAndSpecialtyAndDoctorAvailabilityDate(
            String department,
            String specialty,
            LocalDate doctorAvailabilityDate
    );

    boolean existsByDoctorIdAndDoctorAvailabilityDateAndStartTimeAndEndTime(
            UUID doctorId,
            LocalDate doctorAvailabilityDate,
            LocalTime startTime,
            LocalTime endTime
    );

    Optional<DoctorAvailability> findByDoctorId(
            UUID doctorId

    );
}

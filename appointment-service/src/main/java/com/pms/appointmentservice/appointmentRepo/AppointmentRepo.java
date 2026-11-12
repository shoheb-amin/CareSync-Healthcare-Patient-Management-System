package com.pms.appointmentservice.appointmentRepo;

import com.pms.appointmentservice.entity.Appointment;
import com.pms.appointmentservice.entity.PatientAppointmentStatus;
import org.springframework.data.jpa.repository.JpaRepository;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;
import java.util.UUID;

public interface AppointmentRepo extends JpaRepository<Appointment, UUID> {
    boolean existsByDoctorIdAndAppointmentDateAndAppointmentTime(
            UUID doctorID,
            LocalDate appointmentDate,
            LocalTime appointmentTime
            );

    boolean existsByDoctorIdAndAppointmentDateAndAppointmentTimeAndIdNot(
            UUID doctorId,
            LocalDate appointmentDate,
            LocalTime appointmentTime,
            UUID id
    );

    List<Appointment> findByPatientId(UUID patientId);

    List<Appointment> findByDoctorId(UUID doctorId);

    List<Appointment> findByStatus(PatientAppointmentStatus status);

    List<Appointment> findByAppointmentDateBetween(
            LocalDate startDate,
            LocalDate endDate
    );


}

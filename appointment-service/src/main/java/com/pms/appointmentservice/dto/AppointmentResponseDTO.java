package com.pms.appointmentservice.dto;

import com.pms.appointmentservice.entity.PatientAppointmentStatus;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.UUID;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class AppointmentResponseDTO {
    private UUID id;

    private UUID patientId;
    private String patientName;

    private UUID doctorId;
    private String doctorName;

    private LocalDate appointmentDate;
    private LocalTime appointmentTime;

    private String reason;

    private PatientAppointmentStatus status;



}

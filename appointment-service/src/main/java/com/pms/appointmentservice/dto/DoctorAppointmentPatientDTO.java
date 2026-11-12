package com.pms.appointmentservice.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalTime;
import java.util.UUID;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class DoctorAppointmentPatientDTO {

    private UUID patientId;
    private String patientName;
    private String reason;
    private LocalTime appointmentTime;
}

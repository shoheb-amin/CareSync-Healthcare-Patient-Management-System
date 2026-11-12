package com.pms.appointmentservice.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class DoctorAppointmentHistoryDTO {

    private long count;
    private List<DoctorAppointmentPatientDTO> appointments;
}

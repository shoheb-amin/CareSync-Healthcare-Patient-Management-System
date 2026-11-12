package com.pms.appointmentservice.dto;

import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.UUID;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class DoctorAvailabilityRequestDTO {

    @NotNull
    private UUID doctorId;

    @NotNull
    private String doctorName;

    @NotNull
    private String department;

    @NotNull
    private String specialty;

    @NotNull
    private LocalDate doctorAvailabilityDate;

    @NotNull
    private LocalTime startTime;

    @NotNull
    private LocalTime endTime;
}

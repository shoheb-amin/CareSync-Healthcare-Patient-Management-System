package com.pms.patientservice.dto;

import com.pms.patientservice.dto.validators.CreatePatientValidationGroup;
import com.pms.patientservice.model.Patient;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class PatientRequestDTO {

    @NotBlank
    @Size(max=100,message = "Name cannot exceed 100 characters")
    private String name;

    @NotBlank(message = "EMAIL is required")
    @Email
    private String email;

    @NotBlank(message = "address is required")
    private String address;

    @NotBlank(message = "DateOfBirth is required")
    private String dateOfBirth;

    @NotBlank(groups = CreatePatientValidationGroup.class, message = "Registered date is required")
    private String registeredDate;

    @NotNull(message = "gender is required")
    public Patient.Gender gender;

}

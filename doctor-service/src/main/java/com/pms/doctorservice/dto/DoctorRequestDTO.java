package com.pms.doctorservice.dto;

import com.pms.doctorservice.dto.validators.CreateDoctorValidationGroup;
import com.pms.doctorservice.entity.Doctor;
import jakarta.persistence.Column;
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
public class DoctorRequestDTO {

    @NotBlank
    @Size(max=100,message = "Name cannot exceed 100 characters")
    private String doctorName;

    @NotBlank(message = "EMAIL is required")
    @Email
    private String doctorEmail;

    @NotBlank(message = "phone is required")
    private String doctorPhone;

    @NotBlank(message = "address is required")
    private String doctorAddress;
    @NotBlank(message = "city is required")
    private String city;
    @NotBlank(message = "state is required")
    private String state;
    @NotBlank(message = "zipcode is required")
    private String zipCode;

    @NotBlank(message = "speciality is required")
    private String speciality;

    @NotBlank(message = "department is required")
    private String department;

    @NotNull(message = "gender is required")
    private Doctor.Gender gender;

    @NotNull(message = "qualification is required")
    private String qualification;



}

package com.pms.doctorservice.dto;

import com.pms.doctorservice.entity.Doctor;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class DoctorResponseDTO {
    private String id;
    private String doctorName;
    private String doctorEmail;
    private String doctorPhone;
    private String doctorAddress;
    private String city;
    private String state;
    private String zipCode;
    private String Speciality;
    private String department;
    private Doctor.Gender gender;
    private String qualification;



}

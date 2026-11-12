package com.pms.analyticsservices.dto;

public record DoctorResponseDTO(
        long totalDoctors,
        long cardiologists,
        long neurologists,
        long orthopedics,
        long generalPhysicians

){

}
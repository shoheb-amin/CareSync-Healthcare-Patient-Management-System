package com.pms.doctorservice.mapper;

import com.pms.doctorservice.dto.DoctorRequestDTO;
import com.pms.doctorservice.dto.DoctorResponseDTO;
import com.pms.doctorservice.entity.Doctor;

public class DoctorMapper {
    public static DoctorResponseDTO toDTO(Doctor doctor) {
        DoctorResponseDTO doctorDTO = new DoctorResponseDTO();
        doctorDTO.setId(doctor.getId().toString());
        doctorDTO.setDoctorName(doctor.getDoctorName());
        doctorDTO.setDoctorPhone(doctor.getDoctorPhone());
        doctorDTO.setDoctorEmail(doctor.getDoctorEmail());
        doctorDTO.setDoctorAddress(doctor.getDoctorAddress());
        doctorDTO.setCity(doctor.getCity());
        doctorDTO.setState(doctor.getState());
        doctorDTO.setZipCode(doctor.getZipCode());
        doctorDTO.setDepartment(doctor.getDepartment());
        doctorDTO.setSpeciality(doctor.getSpeciality());
        doctorDTO.setGender(doctor.getGender());
        doctorDTO.setQualification(doctor.getQualification());
        return doctorDTO;
    }

    public static Doctor toEntity(DoctorRequestDTO doctorRequestDTO) {
        Doctor doctor = new Doctor();
        //doctor.setId(doctor.getId());
        doctor.setDoctorName(doctorRequestDTO.getDoctorName());
        doctor.setDoctorPhone(doctorRequestDTO.getDoctorPhone());
        doctor.setDoctorEmail(doctorRequestDTO.getDoctorEmail());
        doctor.setDoctorAddress(doctorRequestDTO.getDoctorAddress());
        doctor.setCity(doctorRequestDTO.getCity());
        doctor.setState(doctorRequestDTO.getState());
        doctor.setZipCode(doctorRequestDTO.getZipCode());
        doctor.setDepartment(doctorRequestDTO.getDepartment());
        doctor.setSpeciality(doctorRequestDTO.getSpeciality());
        doctor.setGender(doctorRequestDTO.getGender());
        doctor.setQualification(doctorRequestDTO.getQualification());
        return doctor;

    }
}

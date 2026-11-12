package com.pms.appointmentservice.service;

import com.pms.appointmentservice.appointmentRepo.DoctorAvailabilityRepo;
import com.pms.appointmentservice.dto.DoctorAvailabilityRequestDTO;
import com.pms.appointmentservice.entity.DoctorAvailability;
import com.pms.appointmentservice.exception.DoctorAvailabilityAlreadyExistsException;
import com.pms.appointmentservice.exception.DoctorAvailabilityNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDate;

import java.time.LocalTime;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class DoctorAvailabilityService {
    @Autowired
    private final DoctorAvailabilityRepo doctorAvailabilityRepo;

    //get availability of specific doctor on a specific date
    public List<DoctorAvailability> getDoctorAvailability(
            UUID doctorId,
            LocalDate doctorAvailabilityDate) {
        List<DoctorAvailability> availability = doctorAvailabilityRepo.findByDoctorIdAndDoctorAvailabilityDate(
                doctorId,
                doctorAvailabilityDate
        );

        if(availability.isEmpty()){
            throw new DoctorAvailabilityNotFoundException(
                    "Doctor with ID " + doctorId +
                            "is not available on " + doctorAvailabilityDate
            );
        }
        return availability;
    }
    //Department+specialty+date
    public List<DoctorAvailability> findAvailableDoctors(
            String department,
            String specialty,
            LocalDate doctorAvailabilityDate
    ){
        return doctorAvailabilityRepo
                .findByDepartmentAndSpecialtyAndDoctorAvailabilityDate(
                        department,
                        specialty,
                        doctorAvailabilityDate
                );
    }

    public boolean isDoctorAvailable(
            UUID doctorId,
            LocalDate doctorAvailabilityDate,
            LocalTime appointmentTime
    ){
        List<DoctorAvailability> availability = doctorAvailabilityRepo.findByDoctorIdAndDoctorAvailabilityDate(
                doctorId,
                doctorAvailabilityDate
        );
        return availability.stream()
                .anyMatch((slot ->
                        !appointmentTime.isBefore(slot.getStartTime())
                && !appointmentTime.isAfter(slot.getEndTime()))
                );
    }

    //create availability method for doctors
    public DoctorAvailability createDoctorAvailability(
        DoctorAvailabilityRequestDTO doctorAvailabilityRequestDTO,UUID doctorId
        ){


        if(doctorAvailabilityRepo.existsByDoctorIdAndDoctorAvailabilityDateAndStartTimeAndEndTime(
                doctorId,
                doctorAvailabilityRequestDTO.getDoctorAvailabilityDate(),
                doctorAvailabilityRequestDTO.getStartTime(),
                doctorAvailabilityRequestDTO.getEndTime()
        )){
            throw new DoctorAvailabilityAlreadyExistsException(
                    "Doctor availability already exists for "
                            + doctorAvailabilityRequestDTO.getDoctorAvailabilityDate()
                            + " from "
                            + doctorAvailabilityRequestDTO.getStartTime()
                            + " to "
                            + doctorAvailabilityRequestDTO.getEndTime()
            );

        }
        DoctorAvailability doctorAvailability = new DoctorAvailability();
        doctorAvailability.setDoctorId(doctorAvailabilityRequestDTO.getDoctorId());
        doctorAvailability.setDoctorName(doctorAvailabilityRequestDTO.getDoctorName());
        doctorAvailability.setDepartment(doctorAvailabilityRequestDTO.getDepartment());
        doctorAvailability.setSpecialty(doctorAvailabilityRequestDTO.getSpecialty());
        doctorAvailability.setDoctorAvailabilityDate(doctorAvailabilityRequestDTO.getDoctorAvailabilityDate());
        doctorAvailability.setStartTime(doctorAvailabilityRequestDTO.getStartTime());
        doctorAvailability.setEndTime(doctorAvailabilityRequestDTO.getEndTime());
        return doctorAvailabilityRepo.save(doctorAvailability);


    }



}

package com.pms.appointmentservice.mapper;

import com.pms.appointmentservice.dto.AppointmentRequestDTO;
import com.pms.appointmentservice.dto.AppointmentResponseDTO;
import com.pms.appointmentservice.entity.Appointment;
import com.pms.appointmentservice.entity.PatientAppointmentStatus;

public class AppointmentMapper {
    public static AppointmentResponseDTO toDTO(Appointment appointment){
        AppointmentResponseDTO appointmentDTO=new AppointmentResponseDTO();
        appointmentDTO.setId(appointment.getId());

        appointmentDTO.setAppointmentTime(appointment.getAppointmentTime());
        appointmentDTO.setAppointmentDate(appointment.getAppointmentDate());

        appointmentDTO.setPatientId(appointment.getPatientId());
        appointmentDTO.setPatientName(appointment.getPatientName());

        appointmentDTO.setDoctorId(appointment.getDoctorId());
        appointmentDTO.setDoctorName(appointment.getDoctorName());

        appointmentDTO.setReason(appointment.getReason());
        appointmentDTO.setStatus(appointment.getStatus());

        return appointmentDTO;



    }

    public static Appointment toModel(AppointmentRequestDTO appointmentRequestDTO){
        Appointment appointment = new Appointment();
        appointment.setPatientId(appointmentRequestDTO.getPatientId());
        appointment.setDoctorId(appointmentRequestDTO.getDoctorId());
        appointment.setAppointmentDate(appointmentRequestDTO.getAppointmentDate());
        appointment.setAppointmentTime(appointmentRequestDTO.getAppointmentTime());
        appointment.setReason(appointmentRequestDTO.getReason());
        appointment.setStatus(PatientAppointmentStatus.SCHEDULED);
        return appointment;
    }
}

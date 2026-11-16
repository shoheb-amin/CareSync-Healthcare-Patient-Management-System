package com.pms.appointmentservice.service;

import com.pms.appointmentservice.appointmentRepo.AppointmentRepo;
import com.pms.appointmentservice.dto.*;
import com.pms.appointmentservice.entity.Appointment;
import com.pms.appointmentservice.entity.PatientAppointmentStatus;
import com.pms.appointmentservice.exception.AppointmentAlreadyExists;
import com.pms.appointmentservice.exception.AppointmentNotFoundException;
import com.pms.appointmentservice.exception.DoctorAvailabilityNotFoundException;
import com.pms.appointmentservice.grpc.DoctorGrpcClient;
import com.pms.appointmentservice.grpc.PatientGrpcClient;
import com.pms.appointmentservice.kafka.AppointmentKafkaProducer;
import com.pms.appointmentservice.mapper.AppointmentMapper;


import doctor.DoctorResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import patient.PatientResponse;

import java.util.List;
import java.util.UUID;

@Slf4j
@RequiredArgsConstructor
@Service
public class AppointmentService {

    private final AppointmentRepo appointmentRepo;

    private final AppointmentKafkaProducer appointmentKafkaProducer;

    private final DoctorAvailabilityService doctorAvailabilityService;

    private final PatientGrpcClient patientGrpcClient;

    private final DoctorGrpcClient doctorGrpcClient;

    @Transactional
    public AppointmentResponseDTO createAppointment(AppointmentRequestDTO appointmentRequestDTO) {
        UUID patientId = appointmentRequestDTO.getPatientId();
        UUID doctorId = appointmentRequestDTO.getDoctorId();

        //check doctor availability
        if(!doctorAvailabilityService.isDoctorAvailable(
                appointmentRequestDTO.getDoctorId(),
                appointmentRequestDTO.getAppointmentDate(),
                appointmentRequestDTO.getAppointmentTime()
        )){
            throw new DoctorAvailabilityNotFoundException(
                    "Doctor is not  Available at "
                    + appointmentRequestDTO.getAppointmentDate()
                    + " at "
                    + appointmentRequestDTO.getAppointmentTime()
            );
        }

        //check for an existing appointment
        if (appointmentRepo.existsByDoctorIdAndAppointmentDateAndAppointmentTime(
                doctorId,
                appointmentRequestDTO.getAppointmentDate(),
                appointmentRequestDTO.getAppointmentTime())) {
            throw new AppointmentAlreadyExists("An appointment with this doctor ID, date and time already exists: " +
                    doctorId
                    + " | Date:"
                    + appointmentRequestDTO.getAppointmentDate() +
                    "| Time:"
                    + appointmentRequestDTO.getAppointmentTime());
        }

        //fetch patient details using patient service grpc
        log.info("Fetching patient details for patient ID: {}", patientId);
        PatientResponse patient =  patientGrpcClient.getPatient(patientId);

        //fetch doctor details using doctor service grpc
        log.info("Fetching patient details for doctor ID: {}", doctorId);
        DoctorResponse doctor =  doctorGrpcClient.getDoctor(doctorId);

        //convert request DTO into Appointment entity
        Appointment newAppointment =
                AppointmentMapper.toModel(appointmentRequestDTO);

        newAppointment.setPatientId(patientId);
        newAppointment.setPatientName(patient.getName());
        newAppointment.setDoctorId(doctorId);
        newAppointment.setDoctorName(doctor.getName());
        newAppointment.setStatus(PatientAppointmentStatus.SCHEDULED);
        Appointment savedAppointment = appointmentRepo.save(newAppointment);

        log.info(">>> Appointment saved:{}", newAppointment.getId());
        //log.info(">>> Calling Billing Service Via gRPC...");

        appointmentKafkaProducer.sendEvent(newAppointment,"APPOINTMENT_CREATED");

        return AppointmentMapper.toDTO(newAppointment);
    }

    //update appointment
    @Transactional
    public AppointmentResponseDTO updateAppointment(UUID appointmentId, AppointmentRescheduleDTO appointmentRescheduleDTO ) {
        Appointment appointment = appointmentRepo.findById(appointmentId)
                        .orElseThrow(()->new AppointmentNotFoundException("Appointment not found with this Appointment ID: "+appointmentId));

        UUID doctorId = appointmentRescheduleDTO.getDoctorId();
        //check availability for the new doctor and time
        if(!doctorAvailabilityService.isDoctorAvailable(
                doctorId,
                appointmentRescheduleDTO.getAppointmentDate(),
                appointmentRescheduleDTO.getAppointmentTime()
        )){
            throw new DoctorAvailabilityNotFoundException(
                    "Doctor is not  Available at "
                            + appointmentRescheduleDTO.getAppointmentDate()
                            + " at "
                            + appointmentRescheduleDTO.getAppointmentTime()
            );
        }

        //check if another appointment already has this doctor/date/time
        if(appointmentRepo.existsByDoctorIdAndAppointmentDateAndAppointmentTimeAndIdNot(
                doctorId,
                appointmentRescheduleDTO.getAppointmentDate(),
                appointmentRescheduleDTO.getAppointmentTime(),
                appointmentId)){

            throw new AppointmentAlreadyExists("An appointment with this doctor ID, date and time already exists: " +
                    doctorId +
                    " | Date:"
                    + appointmentRescheduleDTO.getAppointmentDate() +
                    "| Time:"
                    + appointmentRescheduleDTO.getAppointmentTime());

        }

        //fetch the new doctor's details using gRPC
        DoctorResponse doctor =  doctorGrpcClient.getDoctor(doctorId);

        //update appointment details
        appointment.setDoctorId(doctorId);
        appointment.setDoctorName(doctor.getName());
        appointment.setAppointmentDate(appointmentRescheduleDTO.getAppointmentDate());
        appointment.setAppointmentTime(appointmentRescheduleDTO.getAppointmentTime());
        appointment.setReason(appointmentRescheduleDTO.getReason());
        appointment.setStatus(PatientAppointmentStatus.RESCHEDULED);

        Appointment updatedAppointment = appointmentRepo.save(appointment);

        appointmentKafkaProducer.sendEvent(updatedAppointment,"APPOINTMENT_RESCHEDULED");

        log.info(">>> Appointment updated:{}", updatedAppointment.getId());
         return AppointmentMapper.toDTO(updatedAppointment);

    }

    //get all appointments
    public List<AppointmentResponseDTO> getAllAppointments() {
        List<Appointment> appointments = appointmentRepo.findAll();
        return appointments.stream().map(AppointmentMapper::toDTO).toList();
    }

    //cancel appointment
    public AppointmentResponseDTO cancelAppointment(UUID appointmentId) {
        Appointment appointment = appointmentRepo.findById(appointmentId)
                .orElseThrow(()->
                        new AppointmentNotFoundException
                                ("Appointment not found with this Appointment ID: "
                                        +appointmentId));

        appointment.setStatus(PatientAppointmentStatus.CANCELLED);
        Appointment updatedAppointment = appointmentRepo.save(appointment);
        appointmentKafkaProducer.sendEvent(updatedAppointment, "APPOINTMENT_CANCELLED");
        log.info(">>> Appointment cancelled:{}", updatedAppointment.getId());
        return AppointmentMapper.toDTO(updatedAppointment);
    }

    //appointment history
    public List<AppointmentResponseDTO> getPatientAppointmentsHistory(UUID patientId) {
        List<Appointment> appointments = appointmentRepo.findByPatientId(patientId);
        return appointments.stream().map(AppointmentMapper::toDTO).toList();
    }

    //Count appointments for a particular doctor with count
    public DoctorAppointmentHistoryDTO getDoctorAppointmentHistory(UUID doctorId) {
        List<Appointment> appointments = appointmentRepo.findByDoctorId(doctorId);
        List<DoctorAppointmentPatientDTO> appointmentPatientList = appointments.stream().map(appointment -> new DoctorAppointmentPatientDTO (
                        appointment.getPatientId(),
                        appointment.getPatientName(),
                        appointment.getReason(),
                        appointment.getAppointmentTime()
                ))
                .toList();
        return new DoctorAppointmentHistoryDTO(
                appointmentPatientList.size(),
                appointmentPatientList
        );
    }

    //find by status
    public List<AppointmentResponseDTO> getListByAppointmentStatus(PatientAppointmentStatus status) {
        List<Appointment> appointments = appointmentRepo.findByStatus(status);
        return appointments.stream().map(AppointmentMapper::toDTO).toList();
    }

    //get a single appointment by ID.
    public AppointmentResponseDTO getAppointmentById(UUID appointmentId) {

        Appointment appointment = appointmentRepo.findById(appointmentId)
                .orElseThrow(() ->
                        new AppointmentNotFoundException(
                                "Appointment not found with this Appointment ID: " + appointmentId
                        ));

        return AppointmentMapper.toDTO(appointment);
    }

    //confirm appointment
    @Transactional
    public AppointmentResponseDTO confirmAppointment(UUID appointmentId) {

        Appointment appointment = appointmentRepo.findById(appointmentId)
                .orElseThrow(() -> new AppointmentNotFoundException(
                        "Appointment not found with ID: " + appointmentId
                ));

        if (appointment.getStatus() == PatientAppointmentStatus.CANCELLED) {
            throw new IllegalStateException(
                    "Cancelled appointment cannot be confirmed"
            );
        }

        if (appointment.getStatus() == PatientAppointmentStatus.COMPLETED) {
            throw new IllegalStateException(
                    "Completed appointment cannot be confirmed"
            );
        }

        if (appointment.getStatus() == PatientAppointmentStatus.CONFIRMED) {
            throw new IllegalStateException(
                    "Appointment is already confirmed"
            );
        }

        appointment.setStatus(PatientAppointmentStatus.CONFIRMED);

        Appointment updatedAppointment = appointmentRepo.save(appointment);

        appointmentKafkaProducer.sendEvent(
                updatedAppointment,
                "APPOINTMENT_CONFIRMED"
        );

        log.info("Appointment confirmed: {}", appointmentId);

        return AppointmentMapper.toDTO(updatedAppointment);
    }

    //complete appointment
    @Transactional
    public AppointmentResponseDTO completeAppointment(UUID appointmentId) {

        Appointment appointment = appointmentRepo.findById(appointmentId)
                .orElseThrow(() -> new AppointmentNotFoundException(
                        "Appointment not found with ID: " + appointmentId
                ));

        if (appointment.getStatus() != PatientAppointmentStatus.CONFIRMED) {
            throw new IllegalStateException(
                    "Only confirmed appointments can be completed"
            );
        }

        appointment.setStatus(PatientAppointmentStatus.COMPLETED);

        Appointment updatedAppointment = appointmentRepo.save(appointment);

        appointmentKafkaProducer.sendEvent(
                updatedAppointment,
                "APPOINTMENT_COMPLETED"
        );

        log.info("Appointment completed: {}", appointmentId);

        return AppointmentMapper.toDTO(updatedAppointment);
    }




}


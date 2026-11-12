package com.pms.appointmentservice.controller;


import com.pms.appointmentservice.dto.*;
import com.pms.appointmentservice.dto.validators.CreateAppointmentValidationGroup;
import com.pms.appointmentservice.entity.DoctorAvailability;
import com.pms.appointmentservice.entity.PatientAppointmentStatus;
import com.pms.appointmentservice.service.AppointmentService;
import com.pms.appointmentservice.service.DoctorAvailabilityService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

import org.springframework.http.ResponseEntity;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

@RequiredArgsConstructor
@RestController
@RequestMapping("/appointments")//http://localhost:4006/appointments
@Tag(name="appointment", description = "API for managing appointments")
public class AppointmentController {

    private final AppointmentService appointmentService;

    private final DoctorAvailabilityService doctorAvailabilityService;

    @GetMapping
    @Operation(summary = "Get Appointments")
    public ResponseEntity<List<AppointmentResponseDTO>> getAllAppointments() {
        List<AppointmentResponseDTO> appointmentResponseDTOs = appointmentService.getAllAppointments();
        return ResponseEntity.ok().body(appointmentResponseDTOs);
    }

    @PostMapping
    @Operation(summary = "Create a new Appointment")
    public ResponseEntity<AppointmentResponseDTO> createAppointment(
            @Validated({
                    jakarta.validation.groups.Default.class,
                    CreateAppointmentValidationGroup.class})
            @RequestBody AppointmentRequestDTO appointmentRequestDTO) {

        AppointmentResponseDTO appointmentResponseDTO = appointmentService.createAppointment(appointmentRequestDTO);
        return ResponseEntity.ok().body(appointmentResponseDTO);
    }

    @PutMapping("/{appointmentId}")
    @Operation(summary = "Update a existing Appointment")
    public ResponseEntity<AppointmentResponseDTO> updateAppointment(
            @PathVariable UUID appointmentId,
            @Validated({jakarta.validation.groups.Default.class})
            @Valid @RequestBody AppointmentRescheduleDTO appointmentRescheduleDTO) {
        AppointmentResponseDTO appointmentResponseDTO = appointmentService.updateAppointment(appointmentId, appointmentRescheduleDTO);
        return ResponseEntity.ok().body(appointmentResponseDTO);
    }

    @PatchMapping("/{appointmentId}/cancel")
    @Operation(summary = "Cancel an existing Appointment")
    public ResponseEntity<AppointmentResponseDTO> cancelAppointment(
            @PathVariable UUID appointmentId) {
        AppointmentResponseDTO appointmentResponseDTO = appointmentService.cancelAppointment(appointmentId);
        return ResponseEntity.ok().body(appointmentResponseDTO);
    }

    @GetMapping("/doctor/{doctorId}/availability")
    @Operation(summary = "Get doctor availability")
    public ResponseEntity<List<DoctorAvailability>> getDoctorAvailability(
            @PathVariable UUID doctorId,
            @RequestParam LocalDate availabilityDate) {
        List<DoctorAvailability> availability =
                doctorAvailabilityService.getDoctorAvailability(
                        doctorId,
                        availabilityDate
                );
        return ResponseEntity.ok().body(availability);
    }

    @GetMapping("/doctor/availability/search")
    @Operation(summary = "Find available doctors by department and speciality")
    ResponseEntity<List<DoctorAvailability>> findAvailableDoctors(
            @RequestParam String department,
            @RequestParam String speciality,
            @RequestParam LocalDate availabilityDate) {
        List<DoctorAvailability> availability =
                doctorAvailabilityService.findAvailableDoctors(
                        department,
                        speciality,
                        availabilityDate
                );
        return ResponseEntity.ok().body(availability);
    }

    @GetMapping("/patients/{patientId}/history")
    @Operation(summary = "Get patient appointment history")
    public ResponseEntity<List<AppointmentResponseDTO>> getPatientAppointmentHistory(
            @PathVariable UUID patientId
    ) {
        List<AppointmentResponseDTO> appointments = appointmentService.getPatientAppointmentsHistory(patientId);
        return ResponseEntity.ok().body(appointments);
    }

    @GetMapping("/doctors/{doctorId}/appointment/history")
    @Operation(summary = "Get doctor's appointment history with count")
    public ResponseEntity<DoctorAppointmentHistoryDTO> getDoctorAppointmentHistory(
            @PathVariable UUID doctorId
    ) {
        DoctorAppointmentHistoryDTO doctorAppointmentHistoryDTO = appointmentService.getDoctorAppointmentHistory(doctorId);
        return ResponseEntity.ok().body(doctorAppointmentHistoryDTO);
    }

    @GetMapping("/status")
    @Operation(summary = "Get appointments by status")
    public ResponseEntity<List<AppointmentResponseDTO>> getAllAppointmentsByStatus(
            @RequestParam PatientAppointmentStatus status
    ) {
        List<AppointmentResponseDTO> appointmentsByStatus = appointmentService.getListByAppointmentStatus(status);
        return ResponseEntity.ok().body(appointmentsByStatus);
    }

    @GetMapping("/{appointmentId}")
    @Operation(summary = "Get appointment by ID")
    public ResponseEntity<AppointmentResponseDTO> getAppointmentById(
            @PathVariable UUID appointmentId) {

        return ResponseEntity.ok(
                appointmentService.getAppointmentById(appointmentId)
        );
    }

    @PostMapping("/doctors/{doctorId}/availability")
    @Operation(summary = "Create doctor availability")
    public ResponseEntity<DoctorAvailability> createAvailability(
            @PathVariable UUID doctorId,
            @Valid @RequestBody DoctorAvailabilityRequestDTO requestDTO) {

        DoctorAvailability availability =
                doctorAvailabilityService.createDoctorAvailability(
                        requestDTO,
                        doctorId
                );

        return ResponseEntity.ok().body(availability);
    }
}
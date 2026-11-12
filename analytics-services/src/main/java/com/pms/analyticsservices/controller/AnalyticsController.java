package com.pms.analyticsservices.controller;


import com.pms.analyticsservices.dto.AppointmentResponseDTO;
import com.pms.analyticsservices.dto.PatientResponseDTO;
import com.pms.analyticsservices.dto.PaymentResponseDTO;
import com.pms.analyticsservices.entity.DoctorAnalytics;
import com.pms.analyticsservices.service.AppointmentAnalyticsService;
import com.pms.analyticsservices.service.DoctorAnalyticsService;
import com.pms.analyticsservices.service.PatientAnalyticsService;
import com.pms.analyticsservices.service.PaymentAnalyticsService;
import io.swagger.v3.oas.annotations.Operation;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.math.BigDecimal;
import java.util.List;

@RestController
@RequestMapping("/api/analytics")
@RequiredArgsConstructor
public class AnalyticsController {


    private final PaymentAnalyticsService paymentAnalyticsService;
    private final DoctorAnalyticsService doctorAnalyticsService;
    private final AppointmentAnalyticsService appointmentAnalyticsService;
    private final PatientAnalyticsService patientAnalyticsService;

    @GetMapping("/patients/count")
    @Operation(summary = "Get Total Number of Patients")
    public ResponseEntity<PatientResponseDTO> getTotalPatients() {
        return ResponseEntity.ok(patientAnalyticsService.getPatientStatistics());
    }

    @GetMapping("/appointments/count")
    @Operation(summary = "Get Appointment Statistics")
    public ResponseEntity<AppointmentResponseDTO> getAppointmentStatistics() {
        AppointmentResponseDTO response = appointmentAnalyticsService.getAppointmentStatistics();
        return ResponseEntity.ok(response);
    }

    //Payment Get Methods
    @GetMapping("/payments/count")
    @Operation(summary = "Get Total Payment")
    public ResponseEntity<Long> getTotalPayments() {
        return ResponseEntity.ok(paymentAnalyticsService.getTotalPayments());
    }

    @GetMapping("/payments/successful")
    @Operation(summary = "Get Successfully Payment")
    public ResponseEntity<Long> getSuccessfulPayments() {
        return ResponseEntity.ok(paymentAnalyticsService.getSuccessfulPayments());
    }

    @GetMapping("/payments/failed")
    @Operation(summary = "Get Failed Payment")
    public ResponseEntity<Long> getFailedPayments() {
        return ResponseEntity.ok(paymentAnalyticsService.getFailedPayments());
    }

    @GetMapping("/payments/pending")
    @Operation(summary = "Get Pending Or Not Verified Payment")
    public ResponseEntity<Long> getPendingPayments() {
        return ResponseEntity.ok(paymentAnalyticsService.getPendingPayments());
    }

    @GetMapping("/payments/revenue")
    @Operation(summary = "Get Total Revenue")
    public ResponseEntity<BigDecimal> getTotalRevenue() {
        return ResponseEntity.ok(paymentAnalyticsService.getTotalRevenue());
    }

    @GetMapping("/payments/statistics")
    @Operation(summary = "Get statistics")
    public ResponseEntity<PaymentResponseDTO> getPaymentStatistics() {
        return ResponseEntity.ok(paymentAnalyticsService.getPaymentStatistics());
    }

    //Doctor Get Methods
    @GetMapping("/doctors/count")
    @Operation(summary = "Get Total Number of Doctors")
    public ResponseEntity<Long> getTotalDoctors() {
        return ResponseEntity.ok(doctorAnalyticsService.getTotalDoctors());
    }

    @GetMapping("/doctors/department/{department}")
    @Operation(summary = "Get Doctors By Department")
    public ResponseEntity<Long> getDoctorsByDepartment(@PathVariable String department) {
        return ResponseEntity.ok(doctorAnalyticsService.getDoctorsByDepartment(department));
    }

    @GetMapping("/doctors/city/{city}")
    @Operation(summary = "Get Doctors By their City")
    public ResponseEntity<Long> getDoctorsByCity(@PathVariable String city) {
        return ResponseEntity.ok(doctorAnalyticsService.getDoctorsByCity(city));
    }

    @GetMapping("/doctors")
    @Operation(summary = "Get All Doctors")
    public ResponseEntity<List<DoctorAnalytics>> getAllDoctors() {
        return ResponseEntity.ok(doctorAnalyticsService.getAllDoctors());
    }
}
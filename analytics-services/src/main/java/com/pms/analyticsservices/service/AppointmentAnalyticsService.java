package com.pms.analyticsservices.service;

import com.pms.analyticsservices.dto.AppointmentResponseDTO;
import com.pms.analyticsservices.repository.AppointmentAnalyticsRepo;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class AppointmentAnalyticsService {

    private final AppointmentAnalyticsRepo appointmentAnalyticsRepo;

    public AppointmentResponseDTO getAppointmentStatistics() {

        long totalAppointments = appointmentAnalyticsRepo.count();

        long pendingAppointments = appointmentAnalyticsRepo.countByStatus("PENDING");

        long confirmedAppointments = appointmentAnalyticsRepo.countByStatus("CONFIRMED");

        long completedAppointments = appointmentAnalyticsRepo.countByStatus("COMPLETED");

        long cancelledAppointments = appointmentAnalyticsRepo.countByStatus("CANCELLED");

        return new AppointmentResponseDTO(
                totalAppointments,
                pendingAppointments,
                confirmedAppointments,
                completedAppointments,
                cancelledAppointments
        );
    }
}
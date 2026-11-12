package com.pms.notificationservice.scheduler;

import com.pms.notificationservice.grpc.AppointmentGrpcClient;
import com.pms.notificationservice.service.NotificationService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
@Slf4j
public class AppointmentReminderScheduler {

    private final AppointmentGrpcClient appointmentGrpcClient;
    private final NotificationService notificationService;

    @Scheduled(fixedRate = 1800000)
    public void sendAppointmentReminders() {

        log.info("Checking for upcoming appointments...");

        try {
            var response = appointmentGrpcClient
                            .getUpcomingAppointments(1440);

            response.getAppointmentsList()
                    .forEach(appointment -> {

                        log.info(
                                "Upcoming appointment: {} | Patient: {} | Doctor: {} | Date: {} | Time: {}",
                                appointment.getAppointmentId(),
                                appointment.getPatientName(),
                                appointment.getDoctorName(),
                                appointment.getAppointmentDate(),
                                appointment.getAppointmentTime()
                        );

                        notificationService
                                .processAppointmentReminder(
                                        appointment
                                );
                    });
        } catch (Exception e) {
            log.error("Failed to fetch upcoming appointments", e);
        }
    }
}
package com.pms.appointmentservice.grpc;

import appointment.AppointmentServiceGrpc;
import appointment.UpcomingAppointment;
import appointment.UpcomingAppointmentRequest;
import appointment.UpcomingAppointmentResponse;
import com.pms.appointmentservice.appointmentRepo.AppointmentRepo;
import com.pms.appointmentservice.entity.Appointment;
import io.grpc.stub.StreamObserver;
import lombok.RequiredArgsConstructor;
import net.devh.boot.grpc.server.service.GrpcService;

import java.time.LocalDateTime;

import java.util.List;

@GrpcService
@RequiredArgsConstructor
public class AppointmentGrpcService
        extends AppointmentServiceGrpc.AppointmentServiceImplBase {

    private final AppointmentRepo appointmentRepo;

    @Override
    public void getUpcomingAppointments(
            UpcomingAppointmentRequest request,
            StreamObserver<UpcomingAppointmentResponse> responseObserver) {

        LocalDateTime now = LocalDateTime.now();

        LocalDateTime endTime =
                now.plusMinutes(request.getMinutes());

        List<Appointment> appointments =
                appointmentRepo.findByAppointmentDateBetween(
                        now.toLocalDate(),
                        endTime.toLocalDate()
                );

        UpcomingAppointmentResponse.Builder response =
                UpcomingAppointmentResponse.newBuilder();

        for (Appointment appointment : appointments) {

            LocalDateTime appointmentDateTime =
                    LocalDateTime.of(
                            appointment.getAppointmentDate(),
                            appointment.getAppointmentTime()
                    );

            if (!appointmentDateTime.isBefore(now)
                    && !appointmentDateTime.isAfter(endTime)) {

                UpcomingAppointment upcomingAppointment =
                        UpcomingAppointment.newBuilder()
                                .setAppointmentId(
                                        appointment.getId().toString()
                                )
                                .setPatientId(
                                        appointment.getPatientId().toString()
                                )
                                .setDoctorId(
                                        appointment.getDoctorId().toString()
                                )
                                .setPatientName(
                                        appointment.getPatientName()
                                )
                                .setDoctorName(
                                        appointment.getDoctorName()
                                )
                                .setAppointmentDate(
                                        appointment.getAppointmentDate().toString()
                                )
                                .setAppointmentTime(
                                        appointment.getAppointmentTime().toString()
                                )
                                .build();

                response.addAppointments(upcomingAppointment);
            }
        }

        responseObserver.onNext(response.build());
        responseObserver.onCompleted();
    }
}
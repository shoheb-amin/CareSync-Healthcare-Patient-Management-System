package com.pms.notificationservice.grpc;

import appointment.AppointmentServiceGrpc;
import appointment.UpcomingAppointmentRequest;
import appointment.UpcomingAppointmentResponse;
import io.grpc.ManagedChannel;
import io.grpc.ManagedChannelBuilder;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

@Slf4j
@Service
public class AppointmentGrpcClient {
    private final AppointmentServiceGrpc.AppointmentServiceBlockingStub blockingStub;


    //localhost:9001/BillingService/CreatePatientAccount
    //aws.grpc:123123/BillingService/CreatePatientAccount

    public AppointmentGrpcClient(
            @Value("${appointment.service.address:localhost}") String serverAddress,
            @Value("${appointment.service.grpc.port:9003}") int serverPort
    ) {
        log.info("connecting to Appointment Service GRPC service at {}:{}", serverAddress, serverPort);

        ManagedChannel channel = ManagedChannelBuilder.forAddress(
                serverAddress, serverPort).usePlaintext().build();

        blockingStub = AppointmentServiceGrpc.newBlockingStub(channel);
    }
    public UpcomingAppointmentResponse getUpcomingAppointments(int minutes) {
        UpcomingAppointmentRequest request =
        UpcomingAppointmentRequest.newBuilder()
                .setMinutes(minutes)
                .build();
        return blockingStub.getUpcomingAppointments(request);
    }
}

package com.pms.notificationservice.grpc;

import io.grpc.ManagedChannel;
import io.grpc.ManagedChannelBuilder;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import patient.PatientRequest;
import patient.PatientResponse;
import patient.PatientServiceGrpc;

@Service
public class PatientGrpcClient {

    private final PatientServiceGrpc.PatientServiceBlockingStub blockingStub;

    public PatientGrpcClient(
            @Value("${patient.service.address:localhost}") String serverAddress,
            @Value("${patient.service.grpc.port:9002}") int serverPort
    ) {

        ManagedChannel channel =
                ManagedChannelBuilder
                        .forAddress(serverAddress, serverPort)
                        .usePlaintext()
                        .build();

        blockingStub =
                PatientServiceGrpc.newBlockingStub(channel);
    }

    public PatientResponse getPatient(String patientId) {

        PatientRequest request =
                PatientRequest.newBuilder()
                        .setPatientId(patientId)
                        .build();

        return blockingStub.getPatient(request);
    }
}
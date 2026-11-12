package com.pms.appointmentservice.grpc;

import net.devh.boot.grpc.client.inject.GrpcClient;
import net.devh.boot.grpc.server.service.GrpcService;
import org.springframework.stereotype.Component;
import org.springframework.stereotype.Service;
import patient.PatientRequest;
import patient.PatientResponse;
import patient.PatientServiceGrpc;

import java.util.UUID;
@Component
public class PatientGrpcClient {
    @GrpcClient("patient-service")
    private PatientServiceGrpc.PatientServiceBlockingStub patientStub;
    public PatientResponse getPatient(UUID patientId) {
        PatientRequest request =
                PatientRequest.newBuilder()
                        .setPatientId(patientId
                                .toString())
                        .build();
        return patientStub.getPatient(request);
    }
}

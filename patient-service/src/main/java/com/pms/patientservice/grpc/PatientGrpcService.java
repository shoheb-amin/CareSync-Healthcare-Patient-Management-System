package com.pms.patientservice.grpc;


import com.pms.patientservice.model.Patient;
import com.pms.patientservice.repository.PatientRepo;
import io.grpc.stub.StreamObserver;
import lombok.RequiredArgsConstructor;
import net.devh.boot.grpc.server.service.GrpcService;
import patient.PatientRequest;
import patient.PatientResponse;
import patient.PatientServiceGrpc;

import java.util.UUID;

@GrpcService
@RequiredArgsConstructor
public class PatientGrpcService
        extends PatientServiceGrpc.PatientServiceImplBase {

    private final PatientRepo patientRepo;

    @Override
    public void getPatient(
            PatientRequest request,
            StreamObserver<PatientResponse> responseObserver) {

        UUID patientId = UUID.fromString(request.getPatientId());

        Patient patient = patientRepo.findById(patientId)
                .orElseThrow(() ->
                        new RuntimeException("Patient not found"));

        PatientResponse response =
                PatientResponse.newBuilder()
                        .setPatientId(patient.getId().toString())
                        .setName(patient.getName())
                        .setEmail(patient.getEmail())
                        .build();

        responseObserver.onNext(response);
        responseObserver.onCompleted();
    }
}
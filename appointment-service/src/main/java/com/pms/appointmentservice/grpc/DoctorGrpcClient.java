package com.pms.appointmentservice.grpc;
import doctor.DoctorRequest;
import doctor.DoctorResponse;
import doctor.DoctorServiceGrpc;
import net.devh.boot.grpc.client.inject.GrpcClient;
import net.devh.boot.grpc.server.service.GrpcService;
import org.springframework.stereotype.Component;
import org.springframework.stereotype.Service;

import java.util.UUID;

@Component
public class DoctorGrpcClient {
    @GrpcClient("doctor-service")
    private DoctorServiceGrpc.DoctorServiceBlockingStub doctorStub;
    public DoctorResponse getDoctor(UUID doctorId) {
        DoctorRequest request =
                DoctorRequest.newBuilder()
                        .setDoctorId(doctorId.toString())
                        .build();
        return doctorStub.getDoctor(request);
    }
}

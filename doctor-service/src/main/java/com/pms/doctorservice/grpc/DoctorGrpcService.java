package com.pms.doctorservice.grpc;

import com.pms.doctorservice.entity.Doctor;
import com.pms.doctorservice.repository.DoctorRepo;
import doctor.DoctorRequest;
import doctor.DoctorResponse;
import doctor.DoctorServiceGrpc;
import io.grpc.stub.StreamObserver;
import lombok.RequiredArgsConstructor;
import net.devh.boot.grpc.server.service.GrpcService;


import java.util.UUID;

@GrpcService
@RequiredArgsConstructor
public class DoctorGrpcService extends DoctorServiceGrpc.DoctorServiceImplBase{
    private final DoctorRepo  doctorRepo;

    public void getDoctor(
            DoctorRequest request,
            StreamObserver<DoctorResponse> responseObserver){
        UUID doctorId = UUID.fromString(request.getDoctorId());
        Doctor doctor = doctorRepo.findById(doctorId)
                .orElseThrow(()->
                        new RuntimeException("Doctor Not Found"));
        DoctorResponse response =
                DoctorResponse.newBuilder()
                        .setDoctorId(doctor.getId().toString())
                        .setName(doctor.getDoctorName())
                        .setEmail(doctor.getDoctorEmail())
                        .build();
        responseObserver.onNext(response);
        responseObserver.onCompleted();
    }


}

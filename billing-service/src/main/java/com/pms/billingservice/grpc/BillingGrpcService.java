package com.pms.billingservice.grpc;

import billing.BillingRequest;
import billing.BillingResponse;
import billing.BillingServiceGrpc;
import com.pms.billingservice.entity.BillingAccount;
import com.pms.billingservice.repository.BillingAccountRepo;
import io.grpc.stub.StreamObserver;
import lombok.RequiredArgsConstructor;
import net.devh.boot.grpc.server.service.GrpcService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.util.UUID;

@RequiredArgsConstructor
@GrpcService
public class BillingGrpcService extends BillingServiceGrpc.BillingServiceImplBase {
    private static final Logger log = LoggerFactory.getLogger(BillingGrpcService.class);

    private final BillingAccountRepo billingAccountRepo;

    @Override
    public void createBillingAccount(BillingRequest billingRequest,
                                     StreamObserver<BillingResponse> responseObserver) {
        log.info("createBillingAccount request{}",billingRequest);

        UUID patientId = UUID.fromString(billingRequest.getPatientId());

        BillingAccount billingAccount = billingAccountRepo.findByPatientId(patientId)
                .orElseGet(() ->{
                    BillingAccount account = BillingAccount.builder()
                            .patientId(patientId)
                            .name(billingRequest.getName())
                            .email(billingRequest.getEmail())
                            .status(
                                    BillingAccount.BillingAccountStatus.ACTIVE
                            )
                            .build();
                    return billingAccountRepo.save(account);
                });

        //Business logic - e.g. save to database, perform calculates etc.
        BillingResponse billingResponse = BillingResponse.newBuilder()
                .setAccountId(billingAccount.getId().toString())
                .setStatus(billingAccount.getStatus().name())
                .build();
        responseObserver.onNext(billingResponse);
        responseObserver.onCompleted();
    }
}

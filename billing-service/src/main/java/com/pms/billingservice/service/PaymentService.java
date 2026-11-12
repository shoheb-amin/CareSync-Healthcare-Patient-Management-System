package com.pms.billingservice.service;

import com.pms.billingservice.entity.BillingAccount;
import com.pms.billingservice.entity.Payment;
import com.pms.billingservice.kafka.PaymentKafkaProducer;
import com.pms.billingservice.repository.BillingAccountRepo;
import com.pms.billingservice.repository.PaymentRepo;
import lombok.Builder;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;
@RequiredArgsConstructor
@Builder
@Service
public class PaymentService {

    private final PaymentRepo paymentRepo;
    private final BillingAccountRepo billingAccountRepo;
    private final PaymentKafkaProducer paymentKafkaProducer;

    public Payment createPayment(
            UUID patientId,
            //UUID billingAccountId,
            BigDecimal amount) {

        BillingAccount billingAccount = billingAccountRepo.findByPatientId(patientId).orElseThrow(()->
                new RuntimeException(
                        "Billing account not found: " + patientId
                ));

        Payment payment = Payment.builder()
                .patientId(patientId)
                .billingAccountId(billingAccount.getId())
                .amount(amount)
                .status(Payment.PaymentStatus.PENDING)
                .createdAt(LocalDateTime.now())
                .build();
        return paymentRepo.save(payment);
    }

    //get Payment by patient ID
    public List<Payment> getPaymentHistory(UUID patientId) {
        return paymentRepo.findByPatientId(patientId);
    }

    //get all payments
    public List<Payment> getAllPayments(){
        return paymentRepo.findAll();
    }

    //update PaymentsStatus
    public Payment updatePaymentStatus(
            UUID paymentId,
            Payment.PaymentStatus paymentStatus
    ){
        Payment payment = paymentRepo.findById(paymentId).orElseThrow(()->
                new RuntimeException(
                        "Payment not found: " + paymentId

                ));

        payment.setStatus(paymentStatus);

        if(paymentStatus.equals(Payment.PaymentStatus.SUCCESS)){
            payment.setPaidAt(LocalDateTime.now());
        }
        Payment updatedPayment = paymentRepo.save(payment);

        if(paymentStatus== Payment.PaymentStatus.SUCCESS || paymentStatus == Payment.PaymentStatus.FAILED){
            paymentKafkaProducer.sendEvent(
                    updatedPayment,
                    paymentStatus.name()
            );
        }
        return updatedPayment;
    }


}

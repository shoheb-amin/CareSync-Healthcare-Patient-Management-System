package com.pms.billingservice.kafka;

import com.pms.billingservice.entity.Payment;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.stereotype.Service;
import payment.events.PaymentEvent;

@Slf4j
@Service
@RequiredArgsConstructor
public class PaymentKafkaProducer {

    private final KafkaTemplate<String, byte[]> paymentKafkaTemplate;
    public void sendEvent(Payment payment, String status) {
        PaymentEvent event = PaymentEvent.newBuilder()
                .setPaymentId(payment.getId().toString())
                .setPatientId(payment.getPatientId().toString())
                .setAmount(payment.getAmount().toString())
                .setBillingAccountId(payment.getBillingAccountId().toString())
                .setStatus(status)
                .build();

        paymentKafkaTemplate.send("payment",
                payment.getId().toString(),
                event.toByteArray()
        ).whenComplete((result, exception) -> {
            if (exception == null) {
                log.info(
                        "Payment event sent successfully. Payment ID: {}, Status: {}, Topic: {}, Offset: {}",
                        payment.getId(),
                        status,
                        result.getRecordMetadata().topic(),
                        result.getRecordMetadata().offset()
                );
            } else {
                log.error(
                        "Failed to send payment event. Payment ID: {}, Status: {}",
                        payment.getId(),
                        status,
                        exception
                );
            }
        });
    }
}





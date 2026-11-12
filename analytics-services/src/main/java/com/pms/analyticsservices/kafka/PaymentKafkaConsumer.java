package com.pms.analyticsservices.kafka;

import payment.events.PaymentEvent;

import com.google.protobuf.InvalidProtocolBufferException;

import com.pms.analyticsservices.entity.PaymentAnalytics;
import com.pms.analyticsservices.repository.PaymentAnalyticsRepo;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

import org.springframework.kafka.annotation.KafkaListener;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Slf4j
@Service
@RequiredArgsConstructor
public class PaymentKafkaConsumer {

    private final PaymentAnalyticsRepo paymentAnalyticsRepo;

    @KafkaListener(
            topics = "payment",
            groupId = "analytics-services"
    )
    @Transactional
    public void consumePaymentEvent(byte[] event) {

        try {
            //Deserialize Protobuf event
            PaymentEvent paymentEvent = PaymentEvent.parseFrom(event);
            String paymentId = paymentEvent.getPaymentId();
            log.info("Received payment event: paymentId={}, status={}",
                    paymentId,
                    paymentEvent.getStatus());
            //Find existing payment or create new
            PaymentAnalytics analytics =
                    paymentAnalyticsRepo.findById(paymentId)
                            .orElseGet(PaymentAnalytics::new);

            //Map event data
            analytics.setPaymentId(paymentId);
            analytics.setPatientId(paymentEvent.getPatientId());
            analytics.setBillingAccountId(paymentEvent.getBillingAccountId());
            analytics.setAmount(new BigDecimal(paymentEvent.getAmount()));
            analytics.setStatus(paymentEvent.getStatus());
            analytics.setReceivedAt(LocalDateTime.now());
            paymentAnalyticsRepo.save(analytics);
            log.info("Payment analytics saved successfully: paymentId={}, status={}",
                    paymentId,
                    paymentEvent.getStatus());

        } catch (InvalidProtocolBufferException e) {
            log.error("Failed to deserialize payment event", e);
            throw new IllegalArgumentException("Invalid payment Protobuf event", e);

        } catch (NumberFormatException e) {
            log.error("Invalid payment amount", e);
            throw new IllegalArgumentException("Invalid payment amount", e);
        }
    }
}
package com.pms.notificationservice.kafka;

import com.google.protobuf.InvalidProtocolBufferException;
import com.pms.notificationservice.service.NotificationService;
import lombok.Data;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.kafka.annotation.KafkaListener;
import org.springframework.stereotype.Component;
import payment.events.PaymentEvent;

@Component
@Data
@RequiredArgsConstructor
@Slf4j
public class PaymentKafkaConsumer {
    private final NotificationService notificationService;

    @KafkaListener(
            topics = "payment",
            groupId = "notification-service"
    )
    public void consumePaymentEvent(byte[] event){
        try{
            PaymentEvent paymentEvent = PaymentEvent.parseFrom(event);
            log.info(
                    "Received payment event. Payment ID: {}, Status : {} ",
                    paymentEvent.getPaymentId(),
                    paymentEvent.getStatus()
                    );
            log.info("Calling processPaymentEvent().....");
            notificationService.processPaymentEvent(paymentEvent);
            log.info("processPaymentEvent() completed. Payment ID: {}",paymentEvent.getPaymentId());
        }catch (InvalidProtocolBufferException e){
            log.error("Failed to parse payment event", e);
        }catch (Exception e){
            log.error("Failed to process payment event", e);
        }
    }

}

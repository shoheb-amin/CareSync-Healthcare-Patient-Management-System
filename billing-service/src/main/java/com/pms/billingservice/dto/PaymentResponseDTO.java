package com.pms.billingservice.dto;

import com.pms.billingservice.entity.Payment;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.UUID;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class PaymentResponseDTO {

    private UUID id;
    private UUID patientId;
    private UUID billingAccountId;
    private BigDecimal amount;
    private Payment.PaymentStatus status;
    private LocalDateTime createdAt;
    private LocalDateTime paidAt;
}

package com.pms.analyticsservices.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
public record PaymentResponseDTO(
        long totalPayments,
        long successfulPayments,
        long failedPayments,
        long pendingPayments,
        BigDecimal totalRevenue

) {
}
package com.pms.billingservice.mapper;

import com.pms.billingservice.dto.PaymentResponseDTO;
import com.pms.billingservice.entity.Payment;

public class PaymentMapper {

    public static PaymentResponseDTO toDTO(Payment payment) {
        PaymentResponseDTO dto = new PaymentResponseDTO();
        dto.setId(payment.getId());
        dto.setPatientId(payment.getPatientId());
        dto.setBillingAccountId(payment.getBillingAccountId());
        dto.setAmount(payment.getAmount());
        dto.setStatus(payment.getStatus());
        dto.setCreatedAt(payment.getCreatedAt());
        dto.setPaidAt(payment.getPaidAt());
        return dto;
    }
}

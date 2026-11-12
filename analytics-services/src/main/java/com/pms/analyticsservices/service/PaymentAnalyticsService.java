package com.pms.analyticsservices.service;

import com.pms.analyticsservices.dto.PaymentResponseDTO;
import com.pms.analyticsservices.repository.PaymentAnalyticsRepo;

import lombok.RequiredArgsConstructor;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class PaymentAnalyticsService {

    private final PaymentAnalyticsRepo paymentAnalyticsRepo;


    // Total Payments
    public long getTotalPayments() {
        return paymentAnalyticsRepo.count();
    }
    // Successful Payments
    public long getSuccessfulPayments() {
        return paymentAnalyticsRepo.countPaymentsByStatus("SUCCESS");
    }
    // Failed Payments
    public long getFailedPayments() {
        return paymentAnalyticsRepo.countPaymentsByStatus("FAILED");
    }
    // Pending Payments
    public long getPendingPayments() {
        return paymentAnalyticsRepo.countPaymentsByStatus("PENDING");
    }
    // Total Revenue
    public BigDecimal getTotalRevenue() {
        return paymentAnalyticsRepo.calculateTotalRevenue();
    }
    // Complete Payment Statistics
    public PaymentResponseDTO getPaymentStatistics() {
        return new PaymentResponseDTO(
                getTotalPayments(),
                getSuccessfulPayments(),
                getFailedPayments(),
                getPendingPayments(),
                getTotalRevenue());
    }
}
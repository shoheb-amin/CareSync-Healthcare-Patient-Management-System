package com.pms.analyticsservices.repository;

import com.pms.analyticsservices.entity.PaymentAnalytics;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;

@Repository
public interface PaymentAnalyticsRepo
        extends JpaRepository<PaymentAnalytics, String> {

    @Query("""
            SELECT COUNT(p)
            FROM PaymentAnalytics p
            WHERE UPPER(p.status) = UPPER(:status)
            """)
    long countPaymentsByStatus(@Param("status") String status);


    @Query("""
            SELECT COALESCE(SUM(p.amount), 0)
            FROM PaymentAnalytics p
            WHERE UPPER(p.status) = 'SUCCESS'
            """)
    BigDecimal calculateTotalRevenue();

}
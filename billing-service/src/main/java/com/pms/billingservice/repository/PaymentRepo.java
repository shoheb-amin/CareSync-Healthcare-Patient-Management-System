package com.pms.billingservice.repository;

import com.pms.billingservice.entity.Payment;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.UUID;

public interface PaymentRepo extends JpaRepository<Payment, UUID> {
    List<Payment> findByPatientId(UUID patientId);



}

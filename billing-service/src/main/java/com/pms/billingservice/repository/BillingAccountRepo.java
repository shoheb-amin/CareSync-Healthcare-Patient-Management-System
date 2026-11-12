package com.pms.billingservice.repository;

import com.pms.billingservice.entity.BillingAccount;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;
import java.util.UUID;

public interface BillingAccountRepo extends JpaRepository<BillingAccount, UUID> {

    Optional<BillingAccount> findByPatientId(UUID patientId);
}

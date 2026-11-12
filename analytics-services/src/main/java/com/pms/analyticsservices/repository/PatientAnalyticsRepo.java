package com.pms.analyticsservices.repository;

import com.pms.analyticsservices.entity.PatientAnalytics;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface PatientAnalyticsRepo
        extends JpaRepository<PatientAnalytics, String> {

    long countByEventType(String eventType);

}
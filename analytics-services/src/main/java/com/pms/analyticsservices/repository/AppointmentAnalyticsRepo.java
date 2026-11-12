package com.pms.analyticsservices.repository;

import com.pms.analyticsservices.entity.AppointmentAnalytics;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface AppointmentAnalyticsRepo
        extends JpaRepository<AppointmentAnalytics, String> {

    long countByStatus(String status);

}
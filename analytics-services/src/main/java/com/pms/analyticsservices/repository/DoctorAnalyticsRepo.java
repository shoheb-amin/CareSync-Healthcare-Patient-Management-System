package com.pms.analyticsservices.repository;

import com.pms.analyticsservices.entity.DoctorAnalytics;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

@Repository
public interface DoctorAnalyticsRepo
        extends JpaRepository<DoctorAnalytics, String> {

    long countBySpecialityIgnoreCase(String speciality);

    long countByDepartmentIgnoreCase(String department);

    long countByCityIgnoreCase(String city);

    @Query("""
            SELECT COUNT(d)
            FROM DoctorAnalytics d
            WHERE UPPER(d.status) = 'DOCTOR_CREATED'
            """)
    long countRegisteredDoctors();
}
package com.pms.analyticsservices.service;

import com.pms.analyticsservices.entity.DoctorAnalytics;
import com.pms.analyticsservices.repository.DoctorAnalyticsRepo;

import lombok.RequiredArgsConstructor;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class DoctorAnalyticsService {

    private final DoctorAnalyticsRepo doctorAnalyticsRepo;

    public long getTotalDoctors() {
        return doctorAnalyticsRepo.countRegisteredDoctors();
    }

    public long getDoctorsBySpeciality(String speciality) {
        return doctorAnalyticsRepo.countBySpecialityIgnoreCase(speciality);
    }

    public long getDoctorsByDepartment(String department) {
        return doctorAnalyticsRepo.countByDepartmentIgnoreCase(department);
    }

    public long getDoctorsByCity(String city) {
        return doctorAnalyticsRepo.countByCityIgnoreCase(city);
    }

    public List<DoctorAnalytics> getAllDoctors() {
        return doctorAnalyticsRepo.findAll();
    }
}
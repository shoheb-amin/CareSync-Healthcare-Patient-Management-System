package com.pms.analyticsservices.service;

import com.pms.analyticsservices.dto.PatientResponseDTO;
import com.pms.analyticsservices.repository.PatientAnalyticsRepo;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class PatientAnalyticsService {
    private final PatientAnalyticsRepo patientAnalyticsRepo;
    public PatientResponseDTO getPatientStatistics() {
        long totalPatients = patientAnalyticsRepo.count();
        return new PatientResponseDTO(totalPatients);
    }
}
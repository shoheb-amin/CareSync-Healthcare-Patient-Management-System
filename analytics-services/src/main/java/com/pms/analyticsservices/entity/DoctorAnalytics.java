package com.pms.analyticsservices.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@AllArgsConstructor
@NoArgsConstructor
@Entity
@Table(name = "doctor_analytics")
public class DoctorAnalytics {

    @Id
    private String doctorId;

    @Column(nullable = false)
    private String doctorName;

    @Column(nullable = false)
    private String doctorEmail;

    private String doctorPhone;

    private String doctorAddress;

    private String city;

    private String state;

    private String zipcode;

    private String speciality;

    private String department;

    private String qualification;

    private String gender;

    @Column(nullable = false)
    private String status;

    @Column(nullable = false)
    private LocalDateTime receivedAt;
}
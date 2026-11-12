package com.pms.doctorservice.entity;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.util.UUID;

@Data
@AllArgsConstructor
@NoArgsConstructor
@Entity
@Table(name="doctors")
public class Doctor {
    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    private UUID id;

    @Column(nullable = false)
    private String doctorName;

    @Column(nullable = false)
    private String doctorEmail;

    @Column(nullable = false)
    private String doctorPhone;

    @Column(nullable = false)
    private String doctorAddress;
    @Column(nullable = false)
    private String city;
    @Column(nullable = false)
    private String state;
    @Column(nullable = false)
    private String zipCode;

    @Column(nullable = false)
    private String Speciality;

    @Column(nullable = false)
    private String department;

    @NotNull
    @Enumerated(EnumType.STRING)
    private Gender gender;

    public enum Gender {
        male,female,other
    }

    @Column(nullable = false)
    private String qualification;





}

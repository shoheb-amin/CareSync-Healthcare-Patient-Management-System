package com.pms.doctorservice.controller;

import com.pms.doctorservice.dto.DoctorRequestDTO;
import com.pms.doctorservice.dto.DoctorResponseDTO;
import com.pms.doctorservice.dto.validators.CreateDoctorValidationGroup;
import com.pms.doctorservice.service.DoctorService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import jakarta.validation.groups.Default;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/doctors")//http://localhost:4007:4007/doctors
@Tag(name = "Doctor", description = "API for managing Doctors")
public class DoctorController {
    @Autowired
    private DoctorService doctorService;

    @GetMapping
    @Operation(summary = "Get Doctor")
    public ResponseEntity<List<DoctorResponseDTO>> getDoctors() {
        List<DoctorResponseDTO> patientResponseDTOs = doctorService.getDoctors();
        return ResponseEntity.ok().body(patientResponseDTOs);
    }

    @PostMapping
    @Operation(summary = "Create a new Doctor")
    public ResponseEntity<DoctorResponseDTO> createDoctor(
            @Validated({Default.class, CreateDoctorValidationGroup.class})
            @RequestBody DoctorRequestDTO doctorRequestDTO) {

        DoctorResponseDTO doctorResponseDTO = doctorService.createDoctor(doctorRequestDTO);
        return ResponseEntity.ok().body(doctorResponseDTO);
    }

    @PutMapping("/{id}")
    @Operation(summary = "Update a Patients")
    public ResponseEntity<DoctorResponseDTO> updateDoctor(@PathVariable UUID id,
                                                            @Validated({Default.class})
                                                            @Valid @RequestBody DoctorRequestDTO doctorRequestDTO) {
        DoctorResponseDTO doctorResponseDTO = doctorService.updateDoctor(id, doctorRequestDTO);
        return ResponseEntity.ok().body(doctorResponseDTO);
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "Delete a Patients")
    public ResponseEntity<Void> deleteDoctor(@PathVariable UUID id) {
        doctorService.deleteDoctor(id);
        return ResponseEntity.noContent().build();//204 means no content
    }





}

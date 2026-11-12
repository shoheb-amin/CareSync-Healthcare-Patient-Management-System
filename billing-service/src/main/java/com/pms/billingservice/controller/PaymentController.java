package com.pms.billingservice.controller;

import com.pms.billingservice.dto.PaymentRequestDTO;
import com.pms.billingservice.dto.PaymentResponseDTO;
import com.pms.billingservice.entity.Payment;
import com.pms.billingservice.mapper.PaymentMapper;
import com.pms.billingservice.service.PaymentService;
import io.swagger.v3.oas.annotations.Operation;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/payments")
@RequiredArgsConstructor
public class PaymentController {

    private final PaymentService paymentService;

    @PostMapping
    @Operation(summary = "create a new Payment")
    public ResponseEntity<PaymentResponseDTO> createPayment(@Valid @RequestBody PaymentRequestDTO paymentRequestDTO){
        Payment payment = paymentService.createPayment(
                paymentRequestDTO.getPatientId(),
                paymentRequestDTO.getAmount()
        );
        return ResponseEntity.ok(PaymentMapper.toDTO(payment)
        );
    }

    @GetMapping("/patient/{patientId}")
    @Operation(summary = "Get Paymets History by PatientId")
    public  ResponseEntity<List<PaymentResponseDTO>> getPaymentHistory(@PathVariable UUID patientId){
        List<PaymentResponseDTO> payments =
                paymentService.getPaymentHistory(patientId)
                        .stream()
                        .map(PaymentMapper::toDTO)
                        .toList();
        return ResponseEntity.ok().body(payments);
    }

    @GetMapping
    @Operation(summary = "get all the payments")
    public ResponseEntity<List<PaymentResponseDTO>> getAllPayments(){
        List<PaymentResponseDTO> payments =
                paymentService.getAllPayments()
                        .stream()
                        .map(PaymentMapper::toDTO)
                        .toList();
        return ResponseEntity.ok().body(payments);
    }

    @PatchMapping("/{paymentId}/status")
    @Operation(summary = "change the status of created payments")
    public ResponseEntity<PaymentResponseDTO> updatePaymentStatus(
            @PathVariable UUID paymentId,
            @RequestParam Payment.PaymentStatus paymentStatus){
        Payment payment = paymentService.updatePaymentStatus(paymentId, paymentStatus);
        return ResponseEntity.ok(PaymentMapper.toDTO(payment));
    }
}

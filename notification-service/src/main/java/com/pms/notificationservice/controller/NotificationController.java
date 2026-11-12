package com.pms.notificationservice.controller;

import com.pms.notificationservice.dto.NotificationRequestDTO;
import com.pms.notificationservice.dto.NotificationResponseDTO;
import com.pms.notificationservice.repository.NotificationRepo;
import com.pms.notificationservice.service.NotificationService;
import io.swagger.v3.oas.annotations.Operation;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/notifications")
@RequiredArgsConstructor
public class NotificationController {
    private final NotificationRepo notificationRepo;
    private final NotificationService notificationService;

    @PostMapping
    @Operation(summary = "create a notification")
    public ResponseEntity<NotificationResponseDTO> createNotification(
            @Valid @RequestBody NotificationRequestDTO notificationRequestDTO) {

        NotificationResponseDTO notificationResponseDTO =
                notificationService.createNotification(notificationRequestDTO);

        return ResponseEntity.ok().body(notificationResponseDTO);
    }
}

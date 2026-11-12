package com.pms.appointmentservice.exception;

import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

import java.util.HashMap;
import java.util.Map;

@Slf4j
@RestControllerAdvice
public class GlobalExceptionHandler {

    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<Map<String,String>> MethodArgumentNotValidException(MethodArgumentNotValidException exception){
        Map<String, String> errors = new HashMap<>();
        exception.getBindingResult().getFieldErrors().forEach((
                error) -> errors.put(error.getField(),error.getDefaultMessage()));
        return ResponseEntity.badRequest().body(errors);
    }

    @ExceptionHandler(AppointmentAlreadyExists.class)
    public ResponseEntity<Map<String,String>> AppointmentAlreadyExists(AppointmentAlreadyExists exception){

        log.warn("Appointment already exists{}",exception.getMessage());

        Map<String, String> errors = new HashMap<>();
        errors.put("message","Appointment already exists");
        return ResponseEntity.badRequest().body(errors);
    }
    @ExceptionHandler(AppointmentNotFoundException.class)
    public ResponseEntity<Map<String,String>> AppointmentNotFoundException(AppointmentNotFoundException exception){

        log.warn("Appointment not found{}",exception.getMessage());

        Map<String, String> errors = new HashMap<>();
        errors.put("message","Appointment not found");
        return ResponseEntity.badRequest().body(errors);
    }

    @ExceptionHandler(DoctorAvailabilityAlreadyExistsException.class)
    public ResponseEntity<Map<String,String>> DoctorAvailabilityAlreadyExistsException(DoctorAvailabilityAlreadyExistsException exception){

        log.warn("Doctor already exists{}",exception.getMessage());

        Map<String, String> errors = new HashMap<>();
        errors.put("message","Doctor already exists");
        return ResponseEntity.badRequest().body(errors);
    }

    @ExceptionHandler(DoctorAvailabilityNotFoundException.class)
    public ResponseEntity<Map<String,String>> DoctorAvailabilityNotFoundException(DoctorAvailabilityNotFoundException exception){

        log.warn("Doctor not found{}",exception.getMessage());

        Map<String, String> errors = new HashMap<>();
        errors.put("message","Doctor not found");
        return ResponseEntity.badRequest().body(errors);
    }



}

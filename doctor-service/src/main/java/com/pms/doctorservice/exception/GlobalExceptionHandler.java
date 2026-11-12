package com.pms.doctorservice.exception;

import lombok.extern.slf4j.Slf4j;
import org.slf4j.LoggerFactory;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ControllerAdvice;
import org.springframework.web.bind.annotation.ExceptionHandler;

import java.util.HashMap;
import java.util.Map;
import java.util.logging.Logger;

@Slf4j
@ControllerAdvice
/*@ControllerAdvice is used in Spring Boot to handle exceptions globally across all your controllers.
 * Instead of writing exception-handling code inside every controller, you create one central class.*/

public class GlobalExceptionHandler {

    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<Map<String,String>> handleValidationException(MethodArgumentNotValidException exception){
        Map<String, String> errors = new HashMap<>();
        exception.getBindingResult().getFieldErrors().forEach((
                error) -> errors.put(error.getField(),error.getDefaultMessage()));
        return ResponseEntity.badRequest().body(errors);
    }
    @ExceptionHandler(EmailAlreadyExistsException.class)
    public ResponseEntity<Map<String,String>> handleEmailAlreadyExistsException(EmailAlreadyExistsException exception){

        log.warn("Email already exists{}",exception.getMessage());

        Map<String, String> errors = new HashMap<>();
        errors.put("message","Email already exists");
        return ResponseEntity.badRequest().body(errors);
    }
    @ExceptionHandler(DoctorNotFoundException.class)
    public ResponseEntity<Map<String,String>> handleDoctorNotFoundException(DoctorNotFoundException exception){

        log.warn("Doctor not found{}",exception.getMessage());

        Map<String, String> errors = new HashMap<>();
        errors.put("message","Doctor not found");
        return ResponseEntity.badRequest().body(errors);
    }

}

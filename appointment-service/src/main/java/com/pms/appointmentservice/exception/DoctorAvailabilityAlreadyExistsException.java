package com.pms.appointmentservice.exception;

public class DoctorAvailabilityAlreadyExistsException extends RuntimeException {
    public DoctorAvailabilityAlreadyExistsException(String message) {
        super(message);
    }
}

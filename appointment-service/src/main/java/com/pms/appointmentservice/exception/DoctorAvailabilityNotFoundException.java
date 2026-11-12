package com.pms.appointmentservice.exception;

public class DoctorAvailabilityNotFoundException extends RuntimeException {
    public DoctorAvailabilityNotFoundException(String message) {
        super(message);
    }
}

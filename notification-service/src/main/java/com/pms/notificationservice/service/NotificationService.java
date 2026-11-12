package com.pms.notificationservice.service;

import appointment.UpcomingAppointment;
import appointment.events.AppointmentEvent;
import com.pms.notificationservice.dto.NotificationRequestDTO;
import com.pms.notificationservice.dto.NotificationResponseDTO;
import com.pms.notificationservice.entity.Notification;
import com.pms.notificationservice.grpc.PatientGrpcClient;
import com.pms.notificationservice.mapper.NotificationMapper;
import com.pms.notificationservice.provider.EmailProvider;
import com.pms.notificationservice.provider.SmsProvider;
import com.pms.notificationservice.provider.WhatsAppProvider;
import com.pms.notificationservice.repository.NotificationRepo;
import lombok.Data;

import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import patient.PatientResponse;
import patient.events.PatientEvent;
import payment.events.PaymentEvent;

import java.time.LocalDateTime;
import java.util.UUID;

@Slf4j
@Data
@Service
public class NotificationService {
    private final NotificationRepo notificationRepo;
    private final NotificationSenderService  notificationSenderService;
    private final WhatsAppProvider whatsAppProvider;
    private final SmsProvider smsProvider;
    private final EmailProvider emailProvider;
    private final PatientGrpcClient patientGrpcClient;


    //create notification
    public NotificationResponseDTO createNotification(NotificationRequestDTO notificationRequestDTO) {
        Notification notification = new Notification();
        notification.setRecipientId(notificationRequestDTO.getRecipientId());
        notification.setRecipientType(notificationRequestDTO.getRecipientType());
        notification.setNotificationType(notificationRequestDTO.getNotificationType());
        notification.setNotificationChannel(notificationRequestDTO.getNotificationChannel());
        notification.setSubject(notificationRequestDTO.getSubject());
        notification.setMessage(notificationRequestDTO.getMessage());
        notification.setStatus(Notification.NotificationStatus.PENDING);
        notification.setCreatedAt(LocalDateTime.now());
        Notification saveNotification=notificationRepo.save(notification);

        try {
            // 2. Retrieve recipient details
            String recipient = switch (saveNotification.getRecipientType()) {
                case PATIENT -> {
                    PatientResponse patient = patientGrpcClient.getPatient(
                            saveNotification.getRecipientId().toString());
                    yield patient.getEmail();
                }
                case DOCTOR -> throw new UnsupportedOperationException(
                        "Doctor contact lookup is not implemented yet"
                );
                default -> throw new IllegalArgumentException(
                        "Unsupported recipient type"
                );
            };
            //Send notification
            notificationSenderService.sendNotification(saveNotification, recipient);
        } catch (Exception e) {
            log.error(
                    "Failed to process manual notification. Notification ID: {}",
                    saveNotification.getId(), e
            );

            saveNotification.setStatus(
                    Notification.NotificationStatus.FAILED
            );

            notificationRepo.save(saveNotification);
        }
        return NotificationMapper.toDTO((saveNotification));
    }

    public void processAppointmentEvent(AppointmentEvent appointmentEvent) {

        Notification notification = new Notification();

        notification.setRecipientId(
                UUID.fromString(appointmentEvent.getPatientId())
        );

        notification.setRecipientType(
                Notification.RecipientType.PATIENT
        );

        notification.setNotificationType(
                Notification.NotificationType.APPOINTMENT_CONFIRMATION
        );

        notification.setNotificationChannel(
                Notification.NotificationChannel.EMAIL
        );

        notification.setSubject("Appointment Confirmation");

        notification.setMessage(
                "Your appointment with "
                        + appointmentEvent.getDoctorName()
                        + " is scheduled on "
                        + appointmentEvent.getAppointmentDate()
                        + " at "
                        + appointmentEvent.getAppointmentTime()
        );

        notification.setStatus(
                Notification.NotificationStatus.PENDING
        );

        notification.setCreatedAt(LocalDateTime.now());

        try {

            PatientResponse patient =
                    patientGrpcClient.getPatient(
                            appointmentEvent.getPatientId()
                    );

            Notification savedNotification =
                    notificationRepo.save(notification);

            notificationSenderService.sendNotification(
                    savedNotification,
                    patient.getEmail()
            );

        } catch (Exception e) {

            log.error(
                    "Failed to process appointment confirmation for patientId: {}",
                    appointmentEvent.getPatientId(),
                    e
            );
        }
    }


    public void processPatientEvent(PatientEvent patientEvent) {

        Notification notification = new Notification();

        notification.setRecipientId(
                UUID.fromString(patientEvent.getPatientId())
        );

        notification.setRecipientType(
                Notification.RecipientType.PATIENT
        );

        notification.setNotificationType(
                Notification.NotificationType.REGISTRATION_CONFIRMATION
        );

        notification.setNotificationChannel(
                Notification.NotificationChannel.EMAIL
        );

        notification.setSubject(
                "Registration Confirmation"
        );

        notification.setMessage(
                "Hello "
                        + patientEvent.getName()
                        + ", Patient registration was successful."
        );

        notification.setStatus(
                Notification.NotificationStatus.PENDING
        );

        notification.setCreatedAt(LocalDateTime.now());

        Notification savedNotification =
                notificationRepo.save(notification);

        notificationSenderService.sendNotification(
                savedNotification,
                patientEvent.getEmail()
        );
    }

    public void processAppointmentReminder(
            UpcomingAppointment appointment) {

        UUID patientId =
                UUID.fromString(appointment.getPatientId());

        String patientEmail;
        try {
            PatientResponse patientResponse =
                    patientGrpcClient.getPatient(
                            appointment.getPatientId()
                    );
            patientEmail = patientResponse.getEmail();
        } catch (Exception e) {
            log.error("Failed to fetch patient details for patientId: {}",
                    appointment.getPatientId(), e);
            return;
        }

//        PatientResponse patientResponse =
//                patientGrpcClient.getPatient(
//                        appointment.getPatientId()
//                );
//        String patientEmail = patientResponse.getEmail();

        String message =
                "Reminder: You have an appointment with "
                        + appointment.getDoctorName()
                        + " on "
                        + appointment.getAppointmentDate()
                        + " at "
                        + appointment.getAppointmentTime();

        boolean alreadySent =
                notificationRepo
                        .existsByRecipientIdAndNotificationTypeAndMessage(
                                patientId,
                                Notification.NotificationType.APPOINTMENT_REMINDER,
                                message
                        );

        if (alreadySent) {
            return;
        }

        Notification notification = new Notification();
        notification.setRecipientId(patientId);
        notification.setRecipientType(Notification.RecipientType.PATIENT);
        notification.setNotificationType(Notification.NotificationType.APPOINTMENT_REMINDER);
        notification.setNotificationChannel(Notification.NotificationChannel.EMAIL);
        notification.setSubject("Appointment Reminder");
        notification.setMessage(message);
        notification.setStatus(Notification.NotificationStatus.PENDING);
        notification.setCreatedAt(LocalDateTime.now());
        Notification savedNotification = notificationRepo.save(notification);
        notificationSenderService.sendNotification(
                savedNotification,
                patientEmail
        );
    }

    public void processPaymentEvent(PaymentEvent  paymentEvent) {
        //send a payment confirmation only for successful payments
        if(!"SUCCESS".equalsIgnoreCase(paymentEvent.getStatus())) {
            log.info(
                    "Skipping payment confirmation. Payment Id: {}, Status: {}",
                    paymentEvent.getPaymentId(),
                    paymentEvent.getStatus()
            );
            return;
        }
        try
        {
            UUID patientId = UUID.fromString(paymentEvent.getPatientId());

            //retrieve the patient's email using Patient Service gRPC
            var patient = patientGrpcClient.getPatient(patientId.toString());
            String subject = "Payment Confirmation";
            String message = String.format(
                    """
                    Hello %s,
                    Your payment has been Completed successfully.
                    Payment ID: %s
                    Amount: %s
                    Bill Amount ID: %s
                    Payment Status: %s
                    
                    
                    Thank you for using CareSync!
                    """,
                    patient.getName(),
                    paymentEvent.getPaymentId(),
                    paymentEvent.getAmount(),
                    paymentEvent.getBillingAccountId(),
                    paymentEvent.getStatus()
            );

            //duplicate notification check
            String paymentReference = "Payment ID: " + paymentEvent.getPaymentId();

            boolean alreadyExists =
                    notificationRepo.existsByRecipientIdAndNotificationTypeAndMessageContaining(
                            patientId,
                            Notification.NotificationType.PAYMENT_CONFIRMATION,
                            paymentReference
                    );

            if (alreadyExists) {
                log.info(
                        "Payment confirmation already exists. Payment ID: {}",
                        paymentEvent.getPaymentId()
                );
                return;
            }


            //create the notification record
            Notification notification = new Notification();

            notification.setRecipientId(patientId);
            notification.setRecipientType(Notification.RecipientType.PATIENT);
            notification.setNotificationType(
                    Notification.NotificationType.PAYMENT_CONFIRMATION
            );
            notification.setNotificationChannel(
                    Notification.NotificationChannel.EMAIL
            );
            notification.setSubject(subject);
            notification.setMessage(message);
            notification.setStatus(Notification.NotificationStatus.PENDING);
            notification.setCreatedAt(LocalDateTime.now());

            //save the notification
            notification=notificationRepo.save(notification);

            //send the confirmation email
            notificationSenderService.sendNotification(
                    notification,
                    patient.getEmail()
            );
            log.info("Payment confirmation processed successfully. Payment ID: {}",
                    paymentEvent.getPaymentId()
            );
        }catch (Exception e) {
            log.error(
                    "Failed to process payment event. Payment ID: {}",
                    paymentEvent.getPaymentId(),
                    e
            );
        }
    }

    public void testEmail(String email) {

        notificationSenderService.sendTestEmail(
                email,
                "Notification Service Test",
                "Hello! This is a test email from the Patient Management System."
        );
    }
}

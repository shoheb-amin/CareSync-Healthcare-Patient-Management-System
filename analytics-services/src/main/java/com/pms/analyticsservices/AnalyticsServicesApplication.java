package com.pms.analyticsservices;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.kafka.annotation.EnableKafka;

@SpringBootApplication
@EnableKafka
public class AnalyticsServicesApplication {

    public static void main(String[] args) {
        SpringApplication.run(AnalyticsServicesApplication.class, args);
    }

}

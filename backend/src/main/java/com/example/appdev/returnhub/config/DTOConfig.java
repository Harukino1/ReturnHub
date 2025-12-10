package com.example.appdev.returnhub.config;

import com.example.appdev.returnhub.dto.SubmittedReportRequestDTO;
import com.example.appdev.returnhub.dto.SubmittedReportResponseDTO;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class DTOConfig {
    @Bean
    public SubmittedReportRequestDTO submittedReportRequestDTO() {
        return new SubmittedReportRequestDTO();
    }

    @Bean
    public SubmittedReportResponseDTO submittedReportResponseDTO() {
        return new SubmittedReportResponseDTO();
    }
}

package com.knowledgegrapheditor.kge.config;

import org.springframework.context.annotation.Bean;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
import org.springframework.security.config.annotation.web.configurers.HeadersConfigurer;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.stereotype.Controller;

@Controller
@EnableMethodSecurity
@EnableWebSecurity
public class SecurityConfig {

    @Bean
    public SecurityFilterChain securityConfiguration(HttpSecurity httpSec) throws Exception {
       return httpSec.
               csrf(AbstractHttpConfigurer::disable)
               .headers((headers) -> headers
                       .frameOptions(HeadersConfigurer.FrameOptionsConfig::sameOrigin)
               )
               .authorizeHttpRequests(req -> req.requestMatchers("**").permitAll())
               .build();
    }
}

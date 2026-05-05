package com.teamtask.app.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

// CORS is fully handled in SecurityConfig via CorsConfigurationSource.
// This class is kept as a placeholder for future MVC customizations.
@Configuration
public class WebConfig implements WebMvcConfigurer {
}

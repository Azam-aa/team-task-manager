package com.teamtask.app.config;

import com.teamtask.app.entity.Role;
import com.teamtask.app.entity.User;
import com.teamtask.app.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.crypto.password.PasswordEncoder;

@Configuration
@RequiredArgsConstructor
@Slf4j
public class DataInitializer {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    @Bean
    public CommandLineRunner seedDemoUsers() {
        return args -> {
            // Seed Admin
            if (!userRepository.existsByEmail("admin@demo.com")) {
                User admin = User.builder()
                        .fullName("Admin User")
                        .email("admin@demo.com")
                        .password(passwordEncoder.encode("admin123"))
                        .role(Role.ADMIN)
                        .build();
                userRepository.save(admin);
                log.info("✅ Demo ADMIN created  →  admin@demo.com / admin123");
            }

            // Seed Member
            if (!userRepository.existsByEmail("member@demo.com")) {
                User member = User.builder()
                        .fullName("Member User")
                        .email("member@demo.com")
                        .password(passwordEncoder.encode("member123"))
                        .role(Role.MEMBER)
                        .build();
                userRepository.save(member);
                log.info("✅ Demo MEMBER created  →  member@demo.com / member123");
            }
        };
    }
}

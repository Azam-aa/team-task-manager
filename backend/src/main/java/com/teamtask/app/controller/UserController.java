package com.teamtask.app.controller;

import com.teamtask.app.dto.ApiResponse;
import com.teamtask.app.dto.UserDto;
import com.teamtask.app.entity.User;
import com.teamtask.app.service.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/users")
@RequiredArgsConstructor
public class UserController {

    private final UserService userService;

    @GetMapping
    public ResponseEntity<ApiResponse> getAllUsers(@AuthenticationPrincipal User currentUser) {
        return ResponseEntity.ok(ApiResponse.ok("Users fetched", userService.getAllUsers()));
    }

    @GetMapping("/me")
    public ResponseEntity<ApiResponse> getMe(@AuthenticationPrincipal User currentUser) {
        // Return safe DTO, not the raw entity
        UserDto dto = UserDto.builder()
                .id(currentUser.getId())
                .fullName(currentUser.getFullName())
                .email(currentUser.getEmail())
                .role(currentUser.getRole())
                .build();
        return ResponseEntity.ok(ApiResponse.ok("Current user", dto));
    }
}

package com.teamtask.app.controller;

import com.teamtask.app.dto.ApiResponse;
import com.teamtask.app.dto.ProjectRequest;
import com.teamtask.app.entity.Role;
import com.teamtask.app.entity.User;
import com.teamtask.app.service.ProjectService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/projects")
@RequiredArgsConstructor
public class ProjectController {

    private final ProjectService projectService;

    @GetMapping
    public ResponseEntity<ApiResponse> getAllProjects(@AuthenticationPrincipal User currentUser) {
        return ResponseEntity.ok(ApiResponse.ok("Projects fetched", projectService.getAllProjects(currentUser)));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse> getProject(@PathVariable Long id,
                                                   @AuthenticationPrincipal User currentUser) {
        return ResponseEntity.ok(ApiResponse.ok("Project fetched", projectService.getProject(id, currentUser)));
    }

    @PostMapping
    public ResponseEntity<ApiResponse> createProject(@Valid @RequestBody ProjectRequest request,
                                                      @AuthenticationPrincipal User currentUser) {
        if (currentUser.getRole() != Role.ADMIN) {
            throw new AccessDeniedException("Only admins can create projects");
        }
        return ResponseEntity.ok(ApiResponse.ok("Project created", projectService.createProject(request, currentUser)));
    }

    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse> updateProject(@PathVariable Long id,
                                                      @Valid @RequestBody ProjectRequest request,
                                                      @AuthenticationPrincipal User currentUser) {
        if (currentUser.getRole() != Role.ADMIN) {
            throw new AccessDeniedException("Only admins can update projects");
        }
        return ResponseEntity.ok(ApiResponse.ok("Project updated", projectService.updateProject(id, request, currentUser)));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse> deleteProject(@PathVariable Long id,
                                                      @AuthenticationPrincipal User currentUser) {
        if (currentUser.getRole() != Role.ADMIN) {
            throw new AccessDeniedException("Only admins can delete projects");
        }
        projectService.deleteProject(id, currentUser);
        return ResponseEntity.ok(ApiResponse.ok("Project deleted"));
    }
}

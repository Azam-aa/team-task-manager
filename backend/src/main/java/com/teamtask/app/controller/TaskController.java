package com.teamtask.app.controller;

import com.teamtask.app.dto.ApiResponse;
import com.teamtask.app.dto.TaskRequest;
import com.teamtask.app.entity.TaskStatus;
import com.teamtask.app.entity.User;
import com.teamtask.app.service.TaskService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/tasks")
@RequiredArgsConstructor
public class TaskController {

    private final TaskService taskService;

    @GetMapping("/project/{projectId}")
    public ResponseEntity<ApiResponse> getTasksByProject(
            @PathVariable Long projectId,
            @AuthenticationPrincipal User currentUser) {
        return ResponseEntity.ok(ApiResponse.ok("Tasks fetched",
                taskService.getTasksByProject(projectId, currentUser)));
    }

    @GetMapping("/my")
    public ResponseEntity<ApiResponse> getMyTasks(@AuthenticationPrincipal User currentUser) {
        return ResponseEntity.ok(ApiResponse.ok("Your tasks fetched",
                taskService.getMyTasks(currentUser)));
    }

    @GetMapping("/dashboard")
    public ResponseEntity<ApiResponse> getDashboard(@AuthenticationPrincipal User currentUser) {
        return ResponseEntity.ok(ApiResponse.ok("Dashboard stats",
                taskService.getDashboardStats(currentUser)));
    }

    @PostMapping
    public ResponseEntity<ApiResponse> createTask(
            @Valid @RequestBody TaskRequest request,
            @AuthenticationPrincipal User currentUser) {
        return ResponseEntity.ok(ApiResponse.ok("Task created",
                taskService.createTask(request, currentUser)));
    }

    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse> updateTask(
            @PathVariable Long id,
            @Valid @RequestBody TaskRequest request,
            @AuthenticationPrincipal User currentUser) {
        return ResponseEntity.ok(ApiResponse.ok("Task updated",
                taskService.updateTask(id, request, currentUser)));
    }

    @PatchMapping("/{id}/status")
    public ResponseEntity<ApiResponse> updateTaskStatus(
            @PathVariable Long id,
            @RequestBody Map<String, String> body,
            @AuthenticationPrincipal User currentUser) {
        String statusStr = body.get("status");
        if (statusStr == null) {
            return ResponseEntity.badRequest().body(ApiResponse.error("status field is required"));
        }
        TaskStatus status;
        try {
            status = TaskStatus.valueOf(statusStr);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(
                    ApiResponse.error("Invalid status. Valid values: TO_DO, IN_PROGRESS, DONE"));
        }
        return ResponseEntity.ok(ApiResponse.ok("Task status updated",
                taskService.updateTaskStatus(id, status, currentUser)));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse> deleteTask(
            @PathVariable Long id,
            @AuthenticationPrincipal User currentUser) {
        taskService.deleteTask(id, currentUser);
        return ResponseEntity.ok(ApiResponse.ok("Task deleted"));
    }
}

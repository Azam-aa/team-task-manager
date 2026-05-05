package com.teamtask.app.dto;

import com.teamtask.app.entity.Priority;
import com.teamtask.app.entity.TaskStatus;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.Data;

import java.time.LocalDateTime;

@Data
public class TaskRequest {

    @NotBlank(message = "Task title is required")
    @Size(min = 2, max = 300, message = "Title must be 2-300 characters")
    private String title;

    @Size(max = 2000, message = "Description cannot exceed 2000 characters")
    private String description;

    private TaskStatus status = TaskStatus.TO_DO;

    private Priority priority = Priority.MEDIUM;

    private LocalDateTime dueDate;

    @NotNull(message = "Project ID is required")
    private Long projectId;

    private Long assigneeId;
}

package com.teamtask.app.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data @Builder @NoArgsConstructor @AllArgsConstructor
public class ProjectResponse {
    private Long id;
    private String name;
    private String description;
    private String createdByName;
    private Long createdById;
    private int memberCount;
    private int taskCount;
    private long todoCount;
    private long inProgressCount;
    private long doneCount;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}

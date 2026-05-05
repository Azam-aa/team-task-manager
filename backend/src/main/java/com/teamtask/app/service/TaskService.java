package com.teamtask.app.service;

import com.teamtask.app.dto.DashboardStats;
import com.teamtask.app.dto.TaskRequest;
import com.teamtask.app.dto.TaskResponse;
import com.teamtask.app.entity.*;
import com.teamtask.app.repository.ProjectRepository;
import com.teamtask.app.repository.TaskRepository;
import com.teamtask.app.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class TaskService {

    private final TaskRepository taskRepository;
    private final ProjectRepository projectRepository;
    private final UserRepository userRepository;

    @Transactional
    public TaskResponse createTask(TaskRequest request, User currentUser) {
        Project project = projectRepository.findById(request.getProjectId())
                .orElseThrow(() -> new RuntimeException("Project not found"));

        User assignee = null;
        if (request.getAssigneeId() != null) {
            assignee = userRepository.findById(request.getAssigneeId())
                    .orElseThrow(() -> new RuntimeException("Assignee not found"));
        }

        Task task = Task.builder()
                .title(request.getTitle())
                .description(request.getDescription())
                .status(request.getStatus() != null ? request.getStatus() : TaskStatus.TO_DO)
                .priority(request.getPriority() != null ? request.getPriority() : Priority.MEDIUM)
                .dueDate(request.getDueDate())
                .project(project)
                .assignee(assignee)
                .createdBy(currentUser)
                .build();

        return toResponse(taskRepository.save(task));
    }

    @Transactional
    public TaskResponse updateTask(Long taskId, TaskRequest request, User currentUser) {
        Task task = taskRepository.findById(taskId)
                .orElseThrow(() -> new RuntimeException("Task not found"));

        task.setTitle(request.getTitle());
        task.setDescription(request.getDescription());
        if (request.getStatus() != null) task.setStatus(request.getStatus());
        if (request.getPriority() != null) task.setPriority(request.getPriority());
        task.setDueDate(request.getDueDate());

        if (request.getAssigneeId() != null) {
            User assignee = userRepository.findById(request.getAssigneeId())
                    .orElseThrow(() -> new RuntimeException("Assignee not found"));
            task.setAssignee(assignee);
        } else {
            task.setAssignee(null);
        }

        return toResponse(taskRepository.save(task));
    }

    @Transactional
    public TaskResponse updateTaskStatus(Long taskId, TaskStatus status, User currentUser) {
        Task task = taskRepository.findById(taskId)
                .orElseThrow(() -> new RuntimeException("Task not found"));
        task.setStatus(status);
        return toResponse(taskRepository.save(task));
    }

    public List<TaskResponse> getTasksByProject(Long projectId, User currentUser) {
        return taskRepository.findByProjectId(projectId)
                .stream().map(this::toResponse).collect(Collectors.toList());
    }

    public List<TaskResponse> getMyTasks(User currentUser) {
        return taskRepository.findByAssignee(currentUser)
                .stream().map(this::toResponse).collect(Collectors.toList());
    }

    @Transactional
    public void deleteTask(Long taskId, User currentUser) {
        Task task = taskRepository.findById(taskId)
                .orElseThrow(() -> new RuntimeException("Task not found"));
        boolean isCreator = task.getCreatedBy().getId().equals(currentUser.getId());
        boolean isAdmin = currentUser.getRole() == Role.ADMIN;
        if (!isCreator && !isAdmin) {
            throw new AccessDeniedException("You don't have permission to delete this task");
        }
        taskRepository.delete(task);
    }

    public DashboardStats getDashboardStats(User currentUser) {
        List<Project> projects = projectRepository.findAllAccessibleByUser(currentUser);
        List<Long> projectIds = projects.stream().map(Project::getId).collect(Collectors.toList());

        long totalTasks = 0, todo = 0, inProgress = 0, done = 0;
        if (!projectIds.isEmpty()) {
            List<Task> tasks = taskRepository.findByProjectIds(projectIds);
            totalTasks = tasks.size();
            todo = tasks.stream().filter(t -> t.getStatus() == TaskStatus.TO_DO).count();
            inProgress = tasks.stream().filter(t -> t.getStatus() == TaskStatus.IN_PROGRESS).count();
            done = tasks.stream().filter(t -> t.getStatus() == TaskStatus.DONE).count();
        }

        List<Task> overdueTasks = taskRepository.findOverdueTasks(currentUser, LocalDateTime.now());

        return DashboardStats.builder()
                .totalProjects(projects.size())
                .totalTasks(totalTasks)
                .todoTasks(todo)
                .inProgressTasks(inProgress)
                .doneTasks(done)
                .overdueTasks(overdueTasks.size())
                .totalMembers(userRepository.count())
                .build();
    }

    private TaskResponse toResponse(Task task) {
        boolean overdue = task.getDueDate() != null
                && task.getStatus() != TaskStatus.DONE
                && task.getDueDate().isBefore(LocalDateTime.now());

        return TaskResponse.builder()
                .id(task.getId())
                .title(task.getTitle())
                .description(task.getDescription())
                .status(task.getStatus())
                .priority(task.getPriority())
                .dueDate(task.getDueDate())
                .projectId(task.getProject().getId())
                .projectName(task.getProject().getName())
                .assigneeId(task.getAssignee() != null ? task.getAssignee().getId() : null)
                .assigneeName(task.getAssignee() != null ? task.getAssignee().getFullName() : null)
                .createdById(task.getCreatedBy().getId())
                .createdByName(task.getCreatedBy().getFullName())
                .createdAt(task.getCreatedAt())
                .updatedAt(task.getUpdatedAt())
                .overdue(overdue)
                .build();
    }
}

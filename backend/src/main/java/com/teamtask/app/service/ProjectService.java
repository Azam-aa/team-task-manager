package com.teamtask.app.service;

import com.teamtask.app.dto.ProjectRequest;
import com.teamtask.app.dto.ProjectResponse;
import com.teamtask.app.entity.Project;
import com.teamtask.app.entity.TaskStatus;
import com.teamtask.app.entity.User;
import com.teamtask.app.repository.ProjectRepository;
import com.teamtask.app.repository.TaskRepository;
import com.teamtask.app.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.HashSet;
import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ProjectService {

    private final ProjectRepository projectRepository;
    private final UserRepository userRepository;
    private final TaskRepository taskRepository;

    @Transactional
    public ProjectResponse createProject(ProjectRequest request, User currentUser) {
        Set<User> members = new HashSet<>();
        members.add(currentUser);
        if (request.getMemberIds() != null) {
            members.addAll(userRepository.findAllById(request.getMemberIds()));
        }

        Project project = Project.builder()
                .name(request.getName())
                .description(request.getDescription())
                .createdBy(currentUser)
                .members(members)
                .build();

        return toResponse(projectRepository.save(project));
    }

    @Transactional
    public ProjectResponse updateProject(Long projectId, ProjectRequest request, User currentUser) {
        Project project = projectRepository.findById(projectId)
                .orElseThrow(() -> new RuntimeException("Project not found"));

        if (!project.getCreatedBy().getId().equals(currentUser.getId())) {
            throw new AccessDeniedException("Only the project creator can edit this project");
        }

        project.setName(request.getName());
        project.setDescription(request.getDescription());

        if (request.getMemberIds() != null) {
            Set<User> members = new HashSet<>(userRepository.findAllById(request.getMemberIds()));
            members.add(currentUser);
            project.setMembers(members);
        }

        return toResponse(projectRepository.save(project));
    }

    public List<ProjectResponse> getAllProjects(User currentUser) {
        List<Project> projects = projectRepository.findAllAccessibleByUser(currentUser);
        return projects.stream().map(this::toResponse).collect(Collectors.toList());
    }

    public ProjectResponse getProject(Long projectId, User currentUser) {
        Project project = projectRepository.findById(projectId)
                .orElseThrow(() -> new RuntimeException("Project not found"));

        boolean isMember = project.getMembers().contains(currentUser) ||
                project.getCreatedBy().getId().equals(currentUser.getId());
        if (!isMember) {
            throw new AccessDeniedException("Access denied to this project");
        }
        return toResponse(project);
    }

    @Transactional
    public void deleteProject(Long projectId, User currentUser) {
        Project project = projectRepository.findById(projectId)
                .orElseThrow(() -> new RuntimeException("Project not found"));
        if (!project.getCreatedBy().getId().equals(currentUser.getId())) {
            throw new AccessDeniedException("Only the project creator can delete this project");
        }
        projectRepository.delete(project);
    }

    private ProjectResponse toResponse(Project project) {
        long todo = taskRepository.countByProjectAndStatus(project.getId(), TaskStatus.TO_DO);
        long inProgress = taskRepository.countByProjectAndStatus(project.getId(), TaskStatus.IN_PROGRESS);
        long done = taskRepository.countByProjectAndStatus(project.getId(), TaskStatus.DONE);

        return ProjectResponse.builder()
                .id(project.getId())
                .name(project.getName())
                .description(project.getDescription())
                .createdByName(project.getCreatedBy().getFullName())
                .createdById(project.getCreatedBy().getId())
                .memberCount(project.getMembers().size())
                .taskCount((int)(todo + inProgress + done))
                .todoCount(todo)
                .inProgressCount(inProgress)
                .doneCount(done)
                .createdAt(project.getCreatedAt())
                .updatedAt(project.getUpdatedAt())
                .build();
    }
}

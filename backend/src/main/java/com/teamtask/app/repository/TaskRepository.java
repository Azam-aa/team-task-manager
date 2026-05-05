package com.teamtask.app.repository;

import com.teamtask.app.entity.Task;
import com.teamtask.app.entity.TaskStatus;
import com.teamtask.app.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface TaskRepository extends JpaRepository<Task, Long> {
    List<Task> findByProjectId(Long projectId);
    List<Task> findByAssignee(User user);
    List<Task> findByStatus(TaskStatus status);

    @Query("SELECT t FROM Task t WHERE t.assignee = :user AND t.status <> 'DONE' AND t.dueDate < :now")
    List<Task> findOverdueTasks(User user, LocalDateTime now);

    @Query("SELECT COUNT(t) FROM Task t WHERE t.project.id = :projectId AND t.status = :status")
    long countByProjectAndStatus(Long projectId, TaskStatus status);

    @Query("SELECT t FROM Task t WHERE t.project.id IN :projectIds")
    List<Task> findByProjectIds(List<Long> projectIds);
}

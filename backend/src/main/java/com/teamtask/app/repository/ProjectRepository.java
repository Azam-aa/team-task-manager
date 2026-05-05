package com.teamtask.app.repository;

import com.teamtask.app.entity.Project;
import com.teamtask.app.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ProjectRepository extends JpaRepository<Project, Long> {
    List<Project> findByCreatedBy(User user);

    @Query("SELECT p FROM Project p JOIN p.members m WHERE m = :user")
    List<Project> findByMember(User user);

    @Query("SELECT p FROM Project p WHERE p.createdBy = :user OR :user MEMBER OF p.members")
    List<Project> findAllAccessibleByUser(User user);
}

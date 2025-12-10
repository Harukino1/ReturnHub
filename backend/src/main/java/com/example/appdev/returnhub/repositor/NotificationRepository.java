package com.example.appdev.returnhub.repositor;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import com.example.appdev.returnhub.entity.Notification;

import java.util.List;

@Repository
public interface NotificationRepository extends JpaRepository<Notification, Integer> {
    // Find all notifications for a user, newest first
    List<Notification> findByUser_UserIdOrderByCreatedAtDesc(int userId);

    // Find unread notifications for a user
    List<Notification> findByUser_UserIdAndIsReadFalse(int userId);

    // // Find all notifications for a user
    List<Notification> findByUser_UserId(int userId);

    // Count unread notifications
    long countByUser_UserIdAndIsReadFalse(int userId);

    // Custom query for recent notifications with limit
    @Query("SELECT n FROM Notification n WHERE n.user.userId = :userId ORDER BY n.createdAt DESC")
    List<Notification> findTopNByUser_UserIdOrderByCreatedAtDesc(@Param("userId") int userId, @Param("limit") int limit);
}
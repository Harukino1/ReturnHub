package com.example.appdev.returnhub.repositor;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import com.example.appdev.returnhub.entity.Conversation;

import java.util.List;
import java.util.Optional;

@Repository
public interface ConversationRepository extends JpaRepository<Conversation, Integer> {
    // Find conversations by user ID
    List<Conversation> findByUser_UserIdOrderByConversationIdDesc(int userId);

    // Find conversations by staff ID
    List<Conversation> findByStaff_StaffIdOrderByConversationIdDesc(int staffId);

    // Find conversation between specific user and staff
    @Query("SELECT c FROM Conversation c WHERE c.user.userId = :userId AND c.staff.staffId = :staffId")
    List<Conversation> findByUser_UserIdAndStaff_StaffId(@Param("userId") int userId, @Param("staffId") int staffId);

    // Check if conversation exists between user and the staff
    boolean existsByUser_UserIdAndStaff_StaffId(int userId, int staffId);

    // Find conversation with eager loading?
    @Query("SELECT c FROM Conversation c JOIN FETCH c.user JOIN FETCH c.staff WHERE c.conversationId = :conversationId")
    Optional<Conversation> findByIdWithUsers(@Param("conversationId") int conversationId);
}
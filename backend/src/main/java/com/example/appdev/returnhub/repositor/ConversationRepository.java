package com.example.appdev.returnhub.repositor;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.example.appdev.returnhub.entity.Conversation;

@Repository
public interface ConversationRepository extends JpaRepository<Conversation, Integer> {
}
package com.example.appdev.returnhub.repositor;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import com.example.appdev.returnhub.entity.Claim;

import java.util.List;

@Repository
public interface ClaimRepository extends JpaRepository<Claim, Integer> {
    List<Claim> findByStatus(String status);

    @Query("SELECT c FROM Claim c WHERE c.claimantUser.userId = :userId")
    List<Claim> findByClaimantUser_UserId(@Param("userId") int userId);

    @Query("SELECT c FROM Claim c WHERE c.lostItem.itemId = :itemId")
    List<Claim> findByLostItem_ItemId(@Param("itemId") int itemId);

    @Query("SELECT c FROM Claim c WHERE c.foundItem.itemId = :itemId")
    List<Claim> findByFoundItem_ItemId(@Param("itemId") int itemId);
}
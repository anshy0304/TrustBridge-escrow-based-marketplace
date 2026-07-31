package com.trustbridge.api.repository;

import com.trustbridge.api.model.EscrowTransaction;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface EscrowTransactionRepository extends JpaRepository<EscrowTransaction, Long> {
    List<EscrowTransaction> findByBuyerId(Long buyerId);
    List<EscrowTransaction> findBySellerId(Long sellerId);
    List<EscrowTransaction> findByProductId(Long productId);
    int countByProductId(Long productId);
}

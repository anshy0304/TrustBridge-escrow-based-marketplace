package com.trustbridge.api.repository;

import com.trustbridge.api.model.EscrowTransaction;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

import com.trustbridge.api.model.TransactionStatus;

@Repository
public interface EscrowTransactionRepository extends JpaRepository<EscrowTransaction, Long> {
    List<EscrowTransaction> findByBuyerId(Long buyerId);
    List<EscrowTransaction> findBySellerId(Long sellerId);
    List<EscrowTransaction> findByProductId(Long productId);
    int countByProductId(Long productId);
    int countByProductIdAndStatusIn(Long productId, List<TransactionStatus> statuses);
    List<EscrowTransaction> findByProductIdAndStatusIn(Long productId, List<TransactionStatus> statuses);
}

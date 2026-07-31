package com.trustbridge.api.dto;

import com.trustbridge.api.model.TransactionStatus;
import lombok.Builder;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
@Builder
public class PurchaseHistoryDto {
    private Long transactionId;
    private UserResponseDto buyer;
    private BigDecimal amount;
    private TransactionStatus status;
    private LocalDateTime purchasedAt;
}

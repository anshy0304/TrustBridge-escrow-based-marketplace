package com.trustbridge.api.dto;

import com.trustbridge.api.model.TransactionStatus;
import lombok.Builder;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
@Builder
public class EscrowResponseDto {
    private Long id;
    private String title;
    private String description;
    private Long buyerId;
    private Long sellerId;
    private BigDecimal amount;
    private BigDecimal platformFee;
    private TransactionStatus status;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}

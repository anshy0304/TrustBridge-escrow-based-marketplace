package com.trustbridge.api.dto;

import lombok.Data;
import java.math.BigDecimal;

@Data
public class EscrowRequestDto {
    private String title;
    private String description;
    private Long buyerId;
    private Long sellerId;
    private BigDecimal amount;
}

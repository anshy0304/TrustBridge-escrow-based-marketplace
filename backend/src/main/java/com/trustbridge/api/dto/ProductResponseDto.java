package com.trustbridge.api.dto;

import lombok.Builder;
import lombok.Data;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
@Builder
public class ProductResponseDto {
    private Long id;
    private String title;
    private String description;
    private BigDecimal price;
    private String imageUrl;
    private UserResponseDto seller;
    private boolean active;
    private Integer purchaseCount;
    private LocalDateTime createdAt;
}

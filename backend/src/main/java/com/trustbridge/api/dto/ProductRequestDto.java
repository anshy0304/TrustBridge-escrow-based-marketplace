package com.trustbridge.api.dto;

import lombok.Data;
import java.math.BigDecimal;

@Data
public class ProductRequestDto {
    private String title;
    private String description;
    private BigDecimal price;
    private String imageUrl;
    private Boolean inStock;
}

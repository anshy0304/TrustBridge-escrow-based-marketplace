package com.trustbridge.api.dto;

import com.trustbridge.api.model.Role;
import lombok.Builder;
import lombok.Data;

import java.time.LocalDateTime;

@Data
@Builder
public class UserResponseDto {
    private Long id;
    private String email;
    private Role role;
    private String stripeAccountId;
    private LocalDateTime createdAt;
}

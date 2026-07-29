package com.trustbridge.api.dto;

import com.trustbridge.api.model.Role;
import lombok.Data;

@Data
public class RegisterRequest {
    private String email;
    private String password;
    private Role role; // BUYER or SELLER
}

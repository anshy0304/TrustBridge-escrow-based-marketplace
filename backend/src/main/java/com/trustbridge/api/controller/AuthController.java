package com.trustbridge.api.controller;

import com.trustbridge.api.config.JwtTokenProvider;
import com.trustbridge.api.dto.AuthRequest;
import com.trustbridge.api.dto.AuthResponse;
import com.trustbridge.api.dto.RegisterRequest;
import com.trustbridge.api.dto.UserResponseDto;
import com.trustbridge.api.model.Role;
import com.trustbridge.api.model.User;
import com.trustbridge.api.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/auth")
@RequiredArgsConstructor
@CrossOrigin(origins = {"http://localhost:5173", "http://localhost:3000"})
public class AuthController {

    private final AuthenticationManager authenticationManager;
    private final UserRepository userRepository;
    private final JwtTokenProvider tokenProvider;
    private final PasswordEncoder passwordEncoder;

    @PostMapping("/register")
    public ResponseEntity<?> registerUser(@RequestBody RegisterRequest registerRequest) {
        if (userRepository.findByEmail(registerRequest.getEmail()).isPresent()) {
            return ResponseEntity.badRequest().body("Email is already registered");
        }

        User user = new User();
        user.setEmail(registerRequest.getEmail());
        user.setPasswordHash(passwordEncoder.encode(registerRequest.getPassword()));
        
        // Defaults
        user.setRole(registerRequest.getRole());
        
        if (registerRequest.getRole() == Role.SELLER) {
            user.setVerified(false);
            user.setStripeAccountId("acct_mock_" + java.util.UUID.randomUUID().toString().substring(0, 8));
        } else {
            user.setVerified(true);
        }

        userRepository.save(user);

        // Auto login after registration
        Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(
                        registerRequest.getEmail(),
                        registerRequest.getPassword()
                )
        );

        SecurityContextHolder.getContext().setAuthentication(authentication);
        String jwt = tokenProvider.generateToken(authentication);

        UserResponseDto dto = UserResponseDto.builder()
                .id(user.getId())
                .email(user.getEmail())
                .role(user.getRole())
                .stripeAccountId(user.getStripeAccountId())
                .isVerified(user.isVerified())
                .createdAt(user.getCreatedAt())
                .build();

        return ResponseEntity.ok(new AuthResponse(jwt, dto));
    }

    @PostMapping("/login")
    public ResponseEntity<?> authenticateUser(@RequestBody AuthRequest loginRequest) {

        Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(
                        loginRequest.getEmail(),
                        loginRequest.getPassword()
                )
        );

        SecurityContextHolder.getContext().setAuthentication(authentication);

        String jwt = tokenProvider.generateToken(authentication);
        User user = (User) authentication.getPrincipal();

        UserResponseDto dto = UserResponseDto.builder()
                .id(user.getId())
                .email(user.getEmail())
                .role(user.getRole())
                .stripeAccountId(user.getStripeAccountId())
                .isVerified(user.isVerified())
                .createdAt(user.getCreatedAt())
                .build();

        return ResponseEntity.ok(new AuthResponse(jwt, dto));
    }
}

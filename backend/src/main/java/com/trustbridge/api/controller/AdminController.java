package com.trustbridge.api.controller;

import com.trustbridge.api.dto.EscrowResponseDto;
import com.trustbridge.api.dto.UserResponseDto;
import com.trustbridge.api.service.EscrowService;
import com.trustbridge.api.service.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/admin")
@RequiredArgsConstructor
@CrossOrigin(origins = {"http://localhost:5173", "http://localhost:3000"})
public class AdminController {

    private final UserService userService;
    private final EscrowService escrowService;

    @GetMapping("/users")
    public ResponseEntity<List<UserResponseDto>> getAllUsers() {
        return ResponseEntity.ok(userService.getAllUsers());
    }

    @PostMapping("/users/{id}/verify")
    public ResponseEntity<UserResponseDto> verifySeller(@PathVariable Long id) {
        return ResponseEntity.ok(userService.verifySeller(id));
    }

    @GetMapping("/escrows")
    public ResponseEntity<List<EscrowResponseDto>> getAllEscrows() {
        return ResponseEntity.ok(escrowService.getAllTransactions());
    }

    @PostMapping("/escrows/{id}/resolve")
    public ResponseEntity<EscrowResponseDto> resolveDispute(
            @PathVariable Long id,
            @RequestParam boolean refundBuyer) {
        return ResponseEntity.ok(escrowService.resolveDispute(id, refundBuyer));
    }
}

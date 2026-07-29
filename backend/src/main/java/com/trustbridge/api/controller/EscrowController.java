package com.trustbridge.api.controller;

import com.trustbridge.api.dto.EscrowRequestDto;
import com.trustbridge.api.dto.EscrowResponseDto;
import com.trustbridge.api.service.EscrowService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/escrows")
@RequiredArgsConstructor
public class EscrowController {

    private final EscrowService escrowService;

    @PostMapping
    public ResponseEntity<EscrowResponseDto> createTransaction(@RequestBody EscrowRequestDto requestDto) {
        EscrowResponseDto response = escrowService.createTransaction(requestDto);
        return new ResponseEntity<>(response, HttpStatus.CREATED);
    }

    @GetMapping("/{id}")
    public ResponseEntity<EscrowResponseDto> getTransaction(@PathVariable Long id) {
        return ResponseEntity.ok(escrowService.getTransactionDto(id));
    }

    @PostMapping("/{id}/fund")
    public ResponseEntity<EscrowResponseDto> fundTransaction(@PathVariable Long id) {
        return ResponseEntity.ok(escrowService.fundTransaction(id));
    }

    @PostMapping("/{id}/fulfill")
    public ResponseEntity<EscrowResponseDto> fulfillTransaction(@PathVariable Long id) {
        return ResponseEntity.ok(escrowService.fulfillTransaction(id));
    }

    @PostMapping("/{id}/release")
    public ResponseEntity<EscrowResponseDto> releaseFunds(@PathVariable Long id) {
        return ResponseEntity.ok(escrowService.releaseFunds(id));
    }
}

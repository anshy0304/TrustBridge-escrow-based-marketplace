package com.trustbridge.api.controller;

import com.trustbridge.api.dto.ProductRequestDto;
import com.trustbridge.api.dto.ProductResponseDto;
import com.trustbridge.api.service.ProductService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/products")
@RequiredArgsConstructor
public class ProductController {

    private final ProductService productService;

    @GetMapping
    public ResponseEntity<List<ProductResponseDto>> getActiveProducts() {
        return ResponseEntity.ok(productService.getActiveProducts());
    }

    @GetMapping("/{id}")
    public ResponseEntity<ProductResponseDto> getProduct(@PathVariable Long id) {
        return ResponseEntity.ok(productService.getProductDto(id));
    }

    @GetMapping("/{id}/purchases")
    public ResponseEntity<List<com.trustbridge.api.dto.PurchaseHistoryDto>> getProductPurchases(@PathVariable Long id) {
        return ResponseEntity.ok(productService.getProductPurchases(id));
    }

    @PostMapping
    public ResponseEntity<ProductResponseDto> createProduct(@RequestBody ProductRequestDto requestDto) {
        ProductResponseDto response = productService.createProduct(requestDto);
        return new ResponseEntity<>(response, HttpStatus.CREATED);
    }
}

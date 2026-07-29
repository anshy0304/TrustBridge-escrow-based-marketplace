package com.trustbridge.api.service;

import com.trustbridge.api.dto.ProductRequestDto;
import com.trustbridge.api.dto.ProductResponseDto;
import com.trustbridge.api.dto.UserResponseDto;
import com.trustbridge.api.model.Product;
import com.trustbridge.api.model.Role;
import com.trustbridge.api.model.User;
import com.trustbridge.api.repository.ProductRepository;
import com.trustbridge.api.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ProductService {

    private final ProductRepository productRepository;
    private final UserRepository userRepository;

    public ProductResponseDto createProduct(ProductRequestDto requestDto) {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        User seller = userRepository.findByEmail(email).orElseThrow();

        if (seller.getRole() != Role.SELLER) {
            throw new RuntimeException("Only sellers can create products.");
        }

        Product product = Product.builder()
                .title(requestDto.getTitle())
                .description(requestDto.getDescription())
                .price(requestDto.getPrice())
                .imageUrl(requestDto.getImageUrl())
                .seller(seller)
                .active(true)
                .build();

        return mapToDto(productRepository.save(product));
    }

    public List<ProductResponseDto> getActiveProducts() {
        return productRepository.findByActiveTrueOrderByCreatedAtDesc()
                .stream()
                .map(this::mapToDto)
                .collect(Collectors.toList());
    }

    public Product getProductById(Long id) {
        return productRepository.findById(id).orElseThrow(() -> new RuntimeException("Product not found"));
    }

    public ProductResponseDto getProductDto(Long id) {
        return mapToDto(getProductById(id));
    }

    public ProductResponseDto mapToDto(Product product) {
        User seller = product.getSeller();
        UserResponseDto sellerDto = UserResponseDto.builder()
                .id(seller.getId())
                .email(seller.getEmail())
                .role(seller.getRole())
                .isVerified(seller.isVerified())
                .build();

        return ProductResponseDto.builder()
                .id(product.getId())
                .title(product.getTitle())
                .description(product.getDescription())
                .price(product.getPrice())
                .imageUrl(product.getImageUrl())
                .seller(sellerDto)
                .active(product.isActive())
                .createdAt(product.getCreatedAt())
                .build();
    }
}

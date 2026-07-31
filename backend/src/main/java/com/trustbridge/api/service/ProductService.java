package com.trustbridge.api.service;

import com.trustbridge.api.dto.ProductRequestDto;
import com.trustbridge.api.dto.ProductResponseDto;
import com.trustbridge.api.dto.UserResponseDto;
import com.trustbridge.api.model.Product;
import com.trustbridge.api.model.Role;
import com.trustbridge.api.model.User;
import com.trustbridge.api.repository.ProductRepository;
import com.trustbridge.api.repository.UserRepository;
import com.trustbridge.api.repository.EscrowTransactionRepository;
import com.trustbridge.api.dto.PurchaseHistoryDto;
import com.trustbridge.api.model.TransactionStatus;
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
    private final EscrowTransactionRepository escrowRepository;

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

    public ProductResponseDto updateProduct(Long productId, ProductRequestDto requestDto) {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        User user = userRepository.findByEmail(email).orElseThrow();
        Product product = getProductById(productId);

        if (!product.getSeller().getId().equals(user.getId())) {
            throw new RuntimeException("You can only edit your own products.");
        }

        // The user requested to edit only price and description
        if (requestDto.getDescription() != null) {
            product.setDescription(requestDto.getDescription());
        }
        if (requestDto.getPrice() != null) {
            product.setPrice(requestDto.getPrice());
        }
        
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

    public List<PurchaseHistoryDto> getProductPurchases(Long productId) {
        List<TransactionStatus> validStatuses = List.of(
            TransactionStatus.FUNDED_IN_ESCROW, 
            TransactionStatus.FULFILLED, 
            TransactionStatus.RELEASED, 
            TransactionStatus.IN_DISPUTE,
            TransactionStatus.REFUNDED // Keep refunded in the history log, just don't count it in the total
        );
        return escrowRepository.findByProductIdAndStatusIn(productId, validStatuses).stream().map(tx -> {
            User buyer = tx.getBuyer();
            UserResponseDto buyerDto = UserResponseDto.builder()
                    .id(buyer.getId())
                    .email(buyer.getEmail())
                    .role(buyer.getRole())
                    .isVerified(buyer.isVerified())
                    .build();
            return PurchaseHistoryDto.builder()
                    .transactionId(tx.getId())
                    .buyer(buyerDto)
                    .amount(tx.getAmount())
                    .status(tx.getStatus())
                    .purchasedAt(tx.getCreatedAt())
                    .build();
        }).collect(Collectors.toList());
    }

    public ProductResponseDto mapToDto(Product product) {
        User seller = product.getSeller();
        UserResponseDto sellerDto = UserResponseDto.builder()
                .id(seller.getId())
                .email(seller.getEmail())
                .role(seller.getRole())
                .isVerified(seller.isVerified())
                .build();
        int count = 0;
        if (product.getId() != null) {
            count = escrowRepository.countByProductIdAndStatusIn(product.getId(), 
                List.of(TransactionStatus.FUNDED_IN_ESCROW, TransactionStatus.FULFILLED, TransactionStatus.RELEASED, TransactionStatus.IN_DISPUTE));
        }

        return ProductResponseDto.builder()
                .id(product.getId())
                .title(product.getTitle())
                .description(product.getDescription())
                .price(product.getPrice())
                .imageUrl(product.getImageUrl())
                .seller(sellerDto)
                .active(product.isActive())
                .purchaseCount(count)
                .createdAt(product.getCreatedAt())
                .build();
    }
}

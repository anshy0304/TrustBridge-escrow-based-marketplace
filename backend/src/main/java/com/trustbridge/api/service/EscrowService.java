package com.trustbridge.api.service;

import com.trustbridge.api.dto.EscrowRequestDto;
import com.trustbridge.api.dto.EscrowResponseDto;
import com.trustbridge.api.exception.InvalidStateException;
import com.trustbridge.api.exception.ResourceNotFoundException;
import com.trustbridge.api.model.EscrowTransaction;
import com.trustbridge.api.model.Product;
import com.trustbridge.api.model.TransactionStatus;
import com.trustbridge.api.model.User;
import com.trustbridge.api.repository.EscrowTransactionRepository;
import com.trustbridge.api.repository.ProductRepository;
import com.trustbridge.api.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class EscrowService {

    private final EscrowTransactionRepository escrowRepository;
    private final UserRepository userRepository;
    private final ProductRepository productRepository;
    private final PaymentGatewayService paymentGatewayService;

    // Platform fee percentage (e.g., 5%)
    private static final BigDecimal PLATFORM_FEE_PERCENTAGE = new BigDecimal("0.05");

    @Transactional
    public EscrowResponseDto createTransaction(EscrowRequestDto requestDto) {
        User buyer = userRepository.findById(requestDto.getBuyerId())
                .orElseThrow(() -> new ResourceNotFoundException("Buyer not found"));
        User seller = userRepository.findById(requestDto.getSellerId())
                .orElseThrow(() -> new ResourceNotFoundException("Seller not found"));

        if (!seller.isVerified()) {
            throw new InvalidStateException("Cannot create transaction with an unverified seller.");
        }

        BigDecimal platformFee = requestDto.getAmount().multiply(PLATFORM_FEE_PERCENTAGE);

        EscrowTransaction transaction = EscrowTransaction.builder()
                .title(requestDto.getTitle())
                .description(requestDto.getDescription())
                .buyer(buyer)
                .seller(seller)
                .amount(requestDto.getAmount())
                .platformFee(platformFee)
                .status(TransactionStatus.PENDING_FUNDING)
                .build();

        transaction = escrowRepository.save(transaction);
        return mapToDto(transaction);
    }

    @Transactional
    public EscrowResponseDto createTransactionFromProduct(Long productId) {
        Product product = productRepository.findById(productId)
                .orElseThrow(() -> new RuntimeException("Product not found"));
        
        if (!product.isActive()) {
            throw new RuntimeException("Product is no longer available.");
        }
        
        String buyerEmail = org.springframework.security.core.context.SecurityContextHolder.getContext().getAuthentication().getName();
        User buyer = userRepository.findByEmail(buyerEmail)
                .orElseThrow(() -> new RuntimeException("Buyer not found"));
                
        EscrowRequestDto dto = new EscrowRequestDto();
        dto.setTitle("Purchase: " + product.getTitle());
        dto.setDescription("Escrow for product ID: " + product.getId());
        dto.setAmount(product.getPrice());
        dto.setBuyerId(buyer.getId());
        dto.setSellerId(product.getSeller().getId());
        
        return createTransaction(dto);
    }

    @Transactional
    public EscrowResponseDto fundTransaction(Long transactionId) {
        EscrowTransaction transaction = getTransaction(transactionId);

        if (transaction.getStatus() != TransactionStatus.PENDING_FUNDING) {
            throw new InvalidStateException("Transaction must be in PENDING_FUNDING state to fund.");
        }

        // Simulate payment success and store payment intent ID
        String paymentIntentId = paymentGatewayService.createPaymentIntent(transaction.getAmount(), "INR");
        transaction.setStripePaymentIntentId(paymentIntentId);
        transaction.setStatus(TransactionStatus.FUNDED_IN_ESCROW);

        return mapToDto(escrowRepository.save(transaction));
    }

    @Transactional
    public EscrowResponseDto fulfillTransaction(Long transactionId) {
        EscrowTransaction transaction = getTransaction(transactionId);
        String currentUserEmail = org.springframework.security.core.context.SecurityContextHolder.getContext().getAuthentication().getName();

        if (!transaction.getSeller().getEmail().equals(currentUserEmail)) {
            throw new InvalidStateException("Only the seller can confirm delivery.");
        }

        if (transaction.getStatus() != TransactionStatus.FUNDED_IN_ESCROW) {
            throw new InvalidStateException("Transaction must be FUNDED_IN_ESCROW to be fulfilled.");
        }

        transaction.setStatus(TransactionStatus.FULFILLED);
        return mapToDto(escrowRepository.save(transaction));
    }

    @Transactional
    public EscrowResponseDto releaseFunds(Long transactionId) {
        EscrowTransaction transaction = getTransaction(transactionId);
        String currentUserEmail = org.springframework.security.core.context.SecurityContextHolder.getContext().getAuthentication().getName();

        if (!transaction.getBuyer().getEmail().equals(currentUserEmail)) {
            throw new InvalidStateException("Only the buyer can approve delivery and release funds.");
        }

        if (transaction.getStatus() != TransactionStatus.FULFILLED && transaction.getStatus() != TransactionStatus.FUNDED_IN_ESCROW) {
            throw new InvalidStateException("Transaction cannot be released from current state.");
        }

        if (transaction.getSeller().getStripeAccountId() == null) {
            throw new InvalidStateException("Seller does not have a connected payment account.");
        }

        BigDecimal payoutAmount = transaction.getAmount().subtract(transaction.getPlatformFee());
        String transferId = paymentGatewayService.transferFunds(transaction.getSeller().getStripeAccountId(), payoutAmount, "INR");
        
        transaction.setStripeTransferId(transferId);
        transaction.setStatus(TransactionStatus.RELEASED);

        return mapToDto(escrowRepository.save(transaction));
    }

    @Transactional
    public EscrowResponseDto disputeTransaction(Long transactionId) {
        EscrowTransaction transaction = getTransaction(transactionId);
        String currentUserEmail = org.springframework.security.core.context.SecurityContextHolder.getContext().getAuthentication().getName();

        if (!transaction.getBuyer().getEmail().equals(currentUserEmail) && !transaction.getSeller().getEmail().equals(currentUserEmail)) {
            throw new InvalidStateException("Only the buyer or seller can raise a dispute.");
        }
        
        if (transaction.getStatus() != TransactionStatus.FUNDED_IN_ESCROW && transaction.getStatus() != TransactionStatus.FULFILLED) {
            throw new InvalidStateException("Transaction cannot be disputed from current state.");
        }
        transaction.setStatus(TransactionStatus.IN_DISPUTE);
        return mapToDto(escrowRepository.save(transaction));
    }

    @Transactional
    public EscrowResponseDto resolveDispute(Long transactionId, boolean refundBuyer) {
        EscrowTransaction transaction = getTransaction(transactionId);
        
        if (transaction.getStatus() != TransactionStatus.IN_DISPUTE) {
            throw new InvalidStateException("Transaction is not in dispute.");
        }

        if (refundBuyer) {
            paymentGatewayService.refundPayment(transaction.getStripePaymentIntentId());
            transaction.setStatus(TransactionStatus.REFUNDED);
        } else {
            BigDecimal payoutAmount = transaction.getAmount().subtract(transaction.getPlatformFee());
            String transferId = paymentGatewayService.transferFunds(transaction.getSeller().getStripeAccountId(), payoutAmount, "INR");
            transaction.setStripeTransferId(transferId);
            transaction.setStatus(TransactionStatus.RELEASED);
        }

        return mapToDto(escrowRepository.save(transaction));
    }

    public List<EscrowResponseDto> getAllTransactions() {
        return escrowRepository.findAll().stream()
                .map(this::mapToDto)
                .collect(Collectors.toList());
    }

    public EscrowResponseDto getTransactionDto(Long id) {
        return mapToDto(getTransaction(id));
    }

    private EscrowTransaction getTransaction(Long id) {
        return escrowRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Escrow Transaction not found"));
    }

    private EscrowResponseDto mapToDto(EscrowTransaction transaction) {
        return EscrowResponseDto.builder()
                .id(transaction.getId())
                .title(transaction.getTitle())
                .description(transaction.getDescription())
                .buyerId(transaction.getBuyer().getId())
                .sellerId(transaction.getSeller().getId())
                .amount(transaction.getAmount())
                .platformFee(transaction.getPlatformFee())
                .status(transaction.getStatus())
                .createdAt(transaction.getCreatedAt())
                .updatedAt(transaction.getUpdatedAt())
                .build();
    }
}

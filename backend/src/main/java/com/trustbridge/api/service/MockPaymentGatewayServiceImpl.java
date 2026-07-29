package com.trustbridge.api.service;

import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.util.UUID;

@Service
public class MockPaymentGatewayServiceImpl implements PaymentGatewayService {

    @Override
    public String createPaymentIntent(BigDecimal amount, String currency) {
        // Simulate calling Stripe API to create a payment intent
        return "pi_mock_" + UUID.randomUUID().toString().substring(0, 8);
    }

    @Override
    public String transferFunds(String destinationAccountId, BigDecimal amount, String currency) {
        // Simulate calling Stripe API to transfer funds to connected account
        return "tr_mock_" + UUID.randomUUID().toString().substring(0, 8);
    }

    @Override
    public boolean refundPayment(String paymentIntentId) {
        // Simulate refunding a payment intent
        return true;
    }
}

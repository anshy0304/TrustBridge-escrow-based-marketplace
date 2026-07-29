package com.trustbridge.api.service;

import java.math.BigDecimal;

public interface PaymentGatewayService {
    String createPaymentIntent(BigDecimal amount, String currency);
    String transferFunds(String destinationAccountId, BigDecimal amount, String currency);
    boolean refundPayment(String paymentIntentId);
}

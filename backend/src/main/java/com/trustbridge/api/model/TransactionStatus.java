package com.trustbridge.api.model;

public enum TransactionStatus {
    PENDING_FUNDING,
    FUNDED_IN_ESCROW,
    FULFILLED,
    RELEASED,
    IN_DISPUTE,
    REFUNDED
}

package com.trustbridge.api.config;

import com.trustbridge.api.model.Role;
import com.trustbridge.api.model.User;
import com.trustbridge.api.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
public class DataSeeder implements CommandLineRunner {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    @Override
    public void run(String... args) {
        // Only seed if the database is empty
        if (userRepository.count() == 0) {
            User buyer = User.builder()
                    .email("buyer@test.com")
                    .passwordHash(passwordEncoder.encode("password"))
                    .role(Role.BUYER)
                    .build();
            userRepository.save(buyer);

            User seller = User.builder()
                    .email("seller@test.com")
                    .passwordHash(passwordEncoder.encode("password"))
                    .role(Role.SELLER)
                    .stripeAccountId("acct_1MockStripeId")
                    .isVerified(false)
                    .build();
            userRepository.save(seller);

            User admin = User.builder()
                    .email("admin@test.com")
                    .passwordHash(passwordEncoder.encode("password"))
                    .role(Role.ADMIN)
                    .isVerified(true)
                    .build();
            userRepository.save(admin);

            System.out.println("🌱 Seeded test Buyer (ID: 1), test Seller (ID: 2), and Admin (ID: 3)");
        }
    }
}

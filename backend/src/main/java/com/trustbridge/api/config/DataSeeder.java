package com.trustbridge.api.config;

import com.trustbridge.api.model.Product;
import com.trustbridge.api.model.Role;
import com.trustbridge.api.model.User;
import com.trustbridge.api.repository.ProductRepository;
import com.trustbridge.api.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import java.math.BigDecimal;

@Component
@RequiredArgsConstructor
public class DataSeeder implements CommandLineRunner {

    private final UserRepository userRepository;
    private final ProductRepository productRepository;
    private final PasswordEncoder passwordEncoder;

    @Override
    public void run(String... args) {
        if (userRepository.findByEmail("admin@test.com").isEmpty()) {
            String password = passwordEncoder.encode("password123");

            User admin = User.builder()
                    .email("admin@test.com")
                    .passwordHash(password)
                    .role(Role.ADMIN)
                    .isVerified(true)
                    .build();

            User seller = User.builder()
                    .email("seller@test.com")
                    .passwordHash(password)
                    .role(Role.SELLER)
                    .isVerified(true)
                    .stripeAccountId("acct_mock123")
                    .build();

            User buyer = User.builder()
                    .email("buyer@test.com")
                    .passwordHash(password)
                    .role(Role.BUYER)
                    .isVerified(true)
                    .build();

            userRepository.save(admin);
            seller = userRepository.save(seller);
            userRepository.save(buyer);

            Product product = Product.builder()
                    .title("Premium Web Template")
                    .description("A high quality react web template with lifetime updates.")
                    .price(new BigDecimal("2500.00"))
                    .seller(seller)
                    .imageUrl("https://images.unsplash.com/photo-1498050108023-c5249f4df085")
                    .active(true)
                    .build();
            
            productRepository.save(product);

            System.out.println("Test data seeded! (admin@test.com, seller@test.com, buyer@test.com / password: password123)");
        }
    }
}

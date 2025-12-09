package com.inventory.config;

import com.inventory.entity.User;
import com.inventory.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

@Component
public class DataSeeder implements CommandLineRunner {
    
    @Autowired
    private UserRepository userRepository;
    
    @Autowired
    private PasswordEncoder passwordEncoder;
    
    @Override
    public void run(String... args) throws Exception {
        if (!userRepository.existsByEmail("727723eucs080@skcet.ac.in")) {
            User admin = new User();
            admin.setName("Admin");
            admin.setEmail("727723eucs080@skcet.ac.in");
            admin.setPassword(passwordEncoder.encode("Jaga@123"));
            admin.setRole(User.Role.ADMIN);
            admin.setEnabled(true);
            admin.setEmailNotifications(true);
            admin.setPushNotifications(false);
            admin.setThemePreference("light");
            userRepository.save(admin);
            System.out.println("Admin user seeded successfully!");
        }
    }
}







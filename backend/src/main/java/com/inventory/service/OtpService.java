package com.inventory.service;

import com.inventory.entity.OtpToken;
import com.inventory.repository.OtpTokenRepository;
import com.inventory.util.OtpUtil;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.Optional;

@Service
public class OtpService {
    
    private final OtpTokenRepository otpTokenRepository;
    private final EmailService emailService;
    
    private static final int OTP_EXPIRATION_MINUTES = 5;
    
    public OtpService(OtpTokenRepository otpTokenRepository, EmailService emailService) {
        this.otpTokenRepository = otpTokenRepository;
        this.emailService = emailService;
    }
    
    public String generateAndSendOtp(String email) {
        // Delete existing OTPs for this email
        otpTokenRepository.deleteByEmail(email);
        
        // Generate new OTP
        String otp = OtpUtil.generateOtp();
        
        // Save OTP token
        OtpToken otpToken = new OtpToken();
        otpToken.setEmail(email);
        otpToken.setOtp(otp);
        otpToken.setExpiresAt(LocalDateTime.now().plusMinutes(OTP_EXPIRATION_MINUTES));
        otpToken.setUsed(false);
        otpTokenRepository.save(otpToken);
        
        // Send OTP via email
        emailService.sendOtpEmail(email, otp);
        
        return otp;
    }
    
    public boolean validateOtp(String email, String otp) {
        Optional<OtpToken> otpTokenOpt = otpTokenRepository.findByEmailAndOtpAndUsedFalse(email, otp);
        
        if (otpTokenOpt.isEmpty()) {
            return false;
        }
        
        OtpToken otpToken = otpTokenOpt.get();
        
        // Check if OTP is expired
        if (otpToken.getExpiresAt().isBefore(LocalDateTime.now())) {
            return false;
        }
        
        return true;
    }
    
    @Transactional
    public void markOtpAsUsed(String email, String otp) {
        Optional<OtpToken> otpTokenOpt = otpTokenRepository.findByEmailAndOtpAndUsedFalse(email, otp);
        if (otpTokenOpt.isPresent()) {
            OtpToken otpToken = otpTokenOpt.get();
            otpToken.setUsed(true);
            otpTokenRepository.save(otpToken);
        }
    }
    
    @Scheduled(fixedRate = 3600000) // Run every hour
    @Transactional
    public void cleanupExpiredOtps() {
        otpTokenRepository.deleteByExpiresAtBefore(LocalDateTime.now());
    }
}


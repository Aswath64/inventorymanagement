package com.inventory.util;

import java.util.Random;

public class OtpUtil {
    
    private static final Random random = new Random();
    
    public static String generateOtp() {
        return String.format("%06d", random.nextInt(1000000));
    }
}


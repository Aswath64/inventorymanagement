package com.inventory.service;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@Service
public class FileStorageService {
    
    @Value("${app.upload.product-images}")
    private String uploadDir;
    
    public List<String> saveProductImages(Long productId, MultipartFile[] files) throws IOException {
        List<String> imageUrls = new ArrayList<>();
        
        if (files == null || files.length == 0) {
            return imageUrls;
        }
        
        // Create product-specific directory (e.g. uploads/products/{productId})
        Path productDir = Paths.get(uploadDir, productId.toString());
        Files.createDirectories(productDir);
        
        for (MultipartFile file : files) {
            if (file.isEmpty()) {
                continue;
            }
            
            // Generate unique filename
            String originalFilename = file.getOriginalFilename();
            String extension = originalFilename != null && originalFilename.contains(".") 
                ? originalFilename.substring(originalFilename.lastIndexOf(".")) 
                : "";
            String filename = UUID.randomUUID().toString() + extension;
            
            // Save file
            Path targetLocation = productDir.resolve(filename);
            Files.copy(file.getInputStream(), targetLocation, StandardCopyOption.REPLACE_EXISTING);
            
            // Return relative URL served by WebMvcConfig: /api/images/{productId}/{filename}
            String imageUrl = "/api/images/products/" + productId + "/" + filename;
            imageUrls.add(imageUrl);
        }
        
        return imageUrls;
    }
    
    public void deleteProductImage(String imageUrl) throws IOException {
        // Extract path from URL: /api/images/products/{productId}/{filename}
        String path = imageUrl.replace("/api/images/products/", "");
        Path filePath = Paths.get(uploadDir, path);
        
        if (Files.exists(filePath)) {
            Files.delete(filePath);
        }
    }
    
    public void deleteProductDirectory(Long productId) throws IOException {
        Path productDir = Paths.get(uploadDir, productId.toString());
        if (Files.exists(productDir)) {
            Files.walk(productDir)
                    .sorted((a, b) -> b.compareTo(a))
                    .forEach(path -> {
                        try {
                            Files.delete(path);
                        } catch (IOException e) {
                            throw new RuntimeException("Failed to delete file: " + path, e);
                        }
                    });
        }
    }
    
    /**
     * Save user avatar image
     * Similar to saveProductImages but for single avatar file
     * @param userId - User ID
     * @param file - Avatar image file
     * @return Image URL
     * @throws IOException
     */
    public String saveAvatarImage(Long userId, MultipartFile file) throws IOException {
        if (file == null || file.isEmpty()) {
            throw new IllegalArgumentException("Avatar file is required");
        }
        
        // Get parent directory of product-images (uploads/)
        Path uploadBasePath = Paths.get(uploadDir).getParent();
        if (uploadBasePath == null) {
            uploadBasePath = Paths.get(uploadDir);
        }
        
        // Create avatars directory (e.g. uploads/avatars/{userId})
        Path avatarDir = uploadBasePath.resolve("avatars").resolve(userId.toString());
        Files.createDirectories(avatarDir);
        
        // Generate filename with extension
        String originalFilename = file.getOriginalFilename();
        String extension = originalFilename != null && originalFilename.contains(".") 
            ? originalFilename.substring(originalFilename.lastIndexOf(".")) 
            : ".jpg";
        String filename = "avatar" + extension;
        
        // Delete old avatar if exists (delete all files in avatar directory)
        if (Files.exists(avatarDir)) {
            try {
                Files.walk(avatarDir)
                    .filter(Files::isRegularFile)
                    .forEach(path -> {
                        try {
                            Files.delete(path);
                        } catch (IOException e) {
                            // Ignore if file doesn't exist
                        }
                    });
            } catch (IOException e) {
                // Continue if cleanup fails
            }
        }
        
        // Save new avatar
        Path targetLocation = avatarDir.resolve(filename);
        Files.copy(file.getInputStream(), targetLocation, StandardCopyOption.REPLACE_EXISTING);
        
        // Return relative URL: /api/images/avatars/{userId}/avatar.{ext}
        return "/api/images/avatars/" + userId + "/" + filename;
    }
    
    public void deleteAvatarImage(Long userId) throws IOException {
        Path uploadBasePath = Paths.get(uploadDir).getParent();
        if (uploadBasePath == null) {
            uploadBasePath = Paths.get(uploadDir);
        }
        Path avatarDir = uploadBasePath.resolve("avatars").resolve(userId.toString());
        if (Files.exists(avatarDir)) {
            Files.walk(avatarDir)
                    .sorted((a, b) -> b.compareTo(a))
                    .forEach(path -> {
                        try {
                            Files.delete(path);
                        } catch (IOException e) {
                            throw new RuntimeException("Failed to delete avatar: " + path, e);
                        }
                    });
        }
    }
}


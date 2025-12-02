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
}


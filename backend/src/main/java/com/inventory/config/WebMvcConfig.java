package com.inventory.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.ResourceHandlerRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

import java.nio.file.Paths;

@Configuration
public class WebMvcConfig implements WebMvcConfigurer {
    
    @Value("${app.upload.product-images}")
    private String uploadDir;
    
    @Override
    public void addResourceHandlers(ResourceHandlerRegistry registry) {
        var absoluteUploadPath = Paths.get(uploadDir).toAbsolutePath();
        var parent = absoluteUploadPath.getParent();
        String resourceRoot = (parent != null ? parent : absoluteUploadPath).toString().replace("\\", "/");
        
        // Serve product images and avatar images
        registry.addResourceHandler("/api/images/**")
                .addResourceLocations("file:" + resourceRoot + "/");
    }
}


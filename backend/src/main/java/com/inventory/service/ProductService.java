package com.inventory.service;

import com.inventory.dto.CreateProductRequest;
import com.inventory.dto.ProductDto;
import com.inventory.entity.Category;
import com.inventory.entity.Product;
import com.inventory.entity.ProductImage;
import com.inventory.repository.CategoryRepository;
import com.inventory.repository.ProductImageRepository;
import com.inventory.repository.ProductRepository;
import com.inventory.repository.ReviewRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.math.BigDecimal;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class ProductService {
    
    private final ProductRepository productRepository;
    private final CategoryRepository categoryRepository;
    private final ProductImageRepository productImageRepository;
    private final ReviewRepository reviewRepository;
    private final FileStorageService fileStorageService;
    private final NotificationService notificationService;
    
    public ProductService(ProductRepository productRepository,
                         CategoryRepository categoryRepository,
                         ProductImageRepository productImageRepository,
                         ReviewRepository reviewRepository,
                         FileStorageService fileStorageService,
                         NotificationService notificationService) {
        this.productRepository = productRepository;
        this.categoryRepository = categoryRepository;
        this.productImageRepository = productImageRepository;
        this.reviewRepository = reviewRepository;
        this.fileStorageService = fileStorageService;
        this.notificationService = notificationService;
    }
    
    public Page<ProductDto> getAllProducts(Pageable pageable, Boolean active) {
        return productRepository.searchProducts(null, null, null, null, active, pageable)
                .map(this::toDto);
    }
    
    public Page<ProductDto> searchProducts(String name, Long categoryId, BigDecimal minPrice, 
                                           BigDecimal maxPrice, Boolean active, Pageable pageable) {
        return productRepository.searchProducts(name, categoryId, minPrice, maxPrice, active, pageable)
                .map(this::toDto);
    }
    
    public Page<ProductDto> getProductsByCategory(Long categoryId, Pageable pageable) {
        Category category = categoryRepository.findById(categoryId)
                .orElseThrow(() -> new RuntimeException("Category not found"));
        return (Page<ProductDto>) productRepository.findByCategory(category, pageable)
                .map(this::toDto)
                .map(dto -> dto.getActive() != null && dto.getActive() ? dto : null)
                .filter(dto -> dto != null);
    }
    
    public ProductDto getProductById(Long id) {
        Product product = productRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Product not found"));
        return toDto(product);
    }
    
    @Transactional
    public ProductDto createProduct(CreateProductRequest request, MultipartFile[] images) {
        Category category = categoryRepository.findById(request.getCategoryId())
                .orElseThrow(() -> new RuntimeException("Category not found"));
        
        Product product = new Product();
        product.setName(request.getName());
        product.setDescription(request.getDescription());
        product.setPrice(request.getPrice());
        product.setStock(request.getStock());
        if (request.getActive() != null) {
            product.setActive(request.getActive());
        }
        product.setCategory(category);
        
        product = productRepository.save(product);
        
        // Check for low stock and notify admin/staff
        notificationService.checkAndNotifyLowStock(product);
        
        // Save images
        if (images != null && images.length > 0) {
            try {
                List<String> imageUrls = fileStorageService.saveProductImages(product.getId(), images);
                for (int i = 0; i < imageUrls.size(); i++) {
                    ProductImage productImage = new ProductImage();
                    productImage.setProduct(product);
                    productImage.setImageUrl(imageUrls.get(i));
                    productImage.setIsPrimary(i == 0);
                    productImageRepository.save(productImage);
                }
            } catch (Exception e) {
                throw new RuntimeException("Failed to save product images", e);
            }
        }
        
        return toDto(product);
    }
    
    @Transactional
    public ProductDto updateProduct(Long id, CreateProductRequest request) {
        Product product = productRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Product not found"));
        
        Category category = categoryRepository.findById(request.getCategoryId())
                .orElseThrow(() -> new RuntimeException("Category not found"));
        
        product.setName(request.getName());
        product.setDescription(request.getDescription());
        product.setPrice(request.getPrice());
        product.setStock(request.getStock());
        product.setCategory(category);
        if (request.getActive() != null) {
            product.setActive(request.getActive());
        }
        
        product = productRepository.save(product);
        
        // Check for low stock and notify admin/staff
        notificationService.checkAndNotifyLowStock(product);
        
        return toDto(product);
    }
    
    @Transactional
    public void addProductImages(Long productId, MultipartFile[] images) {
        Product product = productRepository.findById(productId)
                .orElseThrow(() -> new RuntimeException("Product not found"));
        
        if (images != null && images.length > 0) {
            try {
                List<String> imageUrls = fileStorageService.saveProductImages(productId, images);
                for (String imageUrl : imageUrls) {
                    ProductImage productImage = new ProductImage();
                    productImage.setProduct(product);
                    productImage.setImageUrl(imageUrl);
                    productImage.setIsPrimary(false);
                    productImageRepository.save(productImage);
                }
            } catch (Exception e) {
                throw new RuntimeException("Failed to save product images", e);
            }
        }
    }
    
    @Transactional
    public void deleteProductImage(Long productId, Long imageId) {
        ProductImage productImage = productImageRepository.findById(imageId)
                .orElseThrow(() -> new RuntimeException("Image not found"));
        
        if (!productImage.getProduct().getId().equals(productId)) {
            throw new RuntimeException("Image does not belong to this product");
        }
        
        try {
            fileStorageService.deleteProductImage(productImage.getImageUrl());
        } catch (Exception e) {
            // Log error but continue with deletion
        }
        
        productImageRepository.delete(productImage);
    }
    
    @Transactional
    public void deleteProduct(Long id) {
        Product product = productRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Product not found"));
        
        try {
            fileStorageService.deleteProductDirectory(id);
        } catch (Exception e) {
            // Log error but continue with deletion
        }
        
        productRepository.delete(product);
    }
    
    private ProductDto toDto(Product product) {
        List<String> imageUrls;
        if (product.getImages() != null && !product.getImages().isEmpty()) {
            imageUrls = product.getImages().stream()
                    .map(ProductImage::getImageUrl)
                    .collect(Collectors.toList());
        } else {
            imageUrls = productImageRepository.findByProductId(product.getId()).stream()
                    .map(ProductImage::getImageUrl)
                    .collect(Collectors.toList());
        }
        
        Double averageRating = reviewRepository.getAverageRatingByProduct(product);
        Integer reviewCount = product.getReviews().size();
        
        String stockStatus;
        if (product.getStock() == 0) {
            stockStatus = "OUT_OF_STOCK";
        } else if (product.getStock() <= 10) {
            stockStatus = "LOW_STOCK";
        } else {
            stockStatus = "IN_STOCK";
        }
        
        return new ProductDto(
                product.getId(),
                product.getName(),
                product.getDescription(),
                product.getPrice(),
                product.getStock(),
                product.getActive(),
                stockStatus,
                product.getCategory().getId(),
                product.getCategory().getName(),
                imageUrls,
                averageRating,
                reviewCount,
                product.getCreatedAt(),
                product.getUpdatedAt()
        );
    }
}


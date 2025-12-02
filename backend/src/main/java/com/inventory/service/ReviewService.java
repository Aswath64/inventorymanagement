package com.inventory.service;

import com.inventory.dto.CreateReviewRequest;
import com.inventory.dto.ReviewDto;
import com.inventory.entity.OrderItem;
import com.inventory.entity.Product;
import com.inventory.entity.Review;
import com.inventory.entity.User;
import com.inventory.repository.OrderItemRepository;
import com.inventory.repository.ProductRepository;
import com.inventory.repository.ReviewRepository;
import com.inventory.repository.UserRepository;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class ReviewService {
    
    private final ReviewRepository reviewRepository;
    private final ProductRepository productRepository;
    private final UserRepository userRepository;
    private final OrderItemRepository orderItemRepository;
    
    public ReviewService(ReviewRepository reviewRepository, ProductRepository productRepository, 
                        UserRepository userRepository, OrderItemRepository orderItemRepository) {
        this.reviewRepository = reviewRepository;
        this.productRepository = productRepository;
        this.userRepository = userRepository;
        this.orderItemRepository = orderItemRepository;
    }
    
    private User getCurrentUser() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String email = authentication.getName();
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));
    }
    
    public List<ReviewDto> getProductReviews(Long productId) {
        Product product = productRepository.findById(productId)
                .orElseThrow(() -> new RuntimeException("Product not found"));
        List<Review> reviews = reviewRepository.findByProduct(product);
        return reviews.stream().map(this::toDto).collect(Collectors.toList());
    }
    
    @Transactional
    public ReviewDto createReview(CreateReviewRequest request) {
        User user = getCurrentUser();
        Product product = productRepository.findById(request.getProductId())
                .orElseThrow(() -> new RuntimeException("Product not found"));
        
        // Check if user has purchased this product
        List<Long> purchasedProductIds = orderItemRepository.findPurchasedProductIdsByUserId(user.getId());
        if (!purchasedProductIds.contains(product.getId())) {
            throw new RuntimeException("You can only review products you have purchased");
        }
        
        // Check if review already exists
        if (reviewRepository.findByProductAndUser(product, user).isPresent()) {
            throw new RuntimeException("You have already reviewed this product");
        }
        
        Review review = new Review();
        review.setProduct(product);
        review.setUser(user);
        review.setRating(request.getRating());
        review.setComment(request.getComment());
        
        review = reviewRepository.save(review);
        return toDto(review);
    }
    
    @Transactional
    public ReviewDto updateReview(Long reviewId, CreateReviewRequest request) {
        User user = getCurrentUser();
        Review review = reviewRepository.findById(reviewId)
                .orElseThrow(() -> new RuntimeException("Review not found"));
        
        if (!review.getUser().getId().equals(user.getId())) {
            throw new RuntimeException("Unauthorized");
        }
        
        review.setRating(request.getRating());
        review.setComment(request.getComment());
        review = reviewRepository.save(review);
        
        return toDto(review);
    }
    
    @Transactional
    public void deleteReview(Long reviewId) {
        User user = getCurrentUser();
        Review review = reviewRepository.findById(reviewId)
                .orElseThrow(() -> new RuntimeException("Review not found"));
        
        if (!review.getUser().getId().equals(user.getId())) {
            throw new RuntimeException("Unauthorized");
        }
        
        reviewRepository.delete(review);
    }
    
    private ReviewDto toDto(Review review) {
        return new ReviewDto(
                review.getId(),
                review.getProduct().getId(),
                review.getUser().getId(),
                review.getUser().getName(),
                review.getRating(),
                review.getComment(),
                review.getCreatedAt(),
                review.getUpdatedAt()
        );
    }
}


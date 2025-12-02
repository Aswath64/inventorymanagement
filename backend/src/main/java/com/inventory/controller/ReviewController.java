package com.inventory.controller;

import com.inventory.dto.CreateReviewRequest;
import com.inventory.dto.ReviewDto;
import com.inventory.service.ReviewService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api")
@CrossOrigin(origins = "*")
public class ReviewController {
    
    private final ReviewService reviewService;
    
    public ReviewController(ReviewService reviewService) {
        this.reviewService = reviewService;
    }
    
    @GetMapping("/products/{productId}/reviews")
    public ResponseEntity<List<ReviewDto>> getProductReviews(@PathVariable Long productId) {
        return ResponseEntity.ok(reviewService.getProductReviews(productId));
    }
    
    @PostMapping("/customer/reviews")
    @PreAuthorize("hasRole('CUSTOMER')")
    public ResponseEntity<ReviewDto> createReview(@Valid @RequestBody CreateReviewRequest request) {
        return ResponseEntity.ok(reviewService.createReview(request));
    }
    
    @PutMapping("/customer/reviews/{id}")
    @PreAuthorize("hasRole('CUSTOMER')")
    public ResponseEntity<ReviewDto> updateReview(@PathVariable Long id, @Valid @RequestBody CreateReviewRequest request) {
        return ResponseEntity.ok(reviewService.updateReview(id, request));
    }
    
    @DeleteMapping("/customer/reviews/{id}")
    @PreAuthorize("hasRole('CUSTOMER')")
    public ResponseEntity<Void> deleteReview(@PathVariable Long id) {
        reviewService.deleteReview(id);
        return ResponseEntity.noContent().build();
    }
}


package com.inventory.controller;

import com.inventory.dto.WishlistDto;
import com.inventory.service.WishlistService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/customer/wishlist")
@CrossOrigin(origins = "*")
@PreAuthorize("hasRole('CUSTOMER')")
public class WishlistController {
    
    private final WishlistService wishlistService;
    
    public WishlistController(WishlistService wishlistService) {
        this.wishlistService = wishlistService;
    }
    
    @GetMapping
    public ResponseEntity<List<WishlistDto>> getWishlist() {
        return ResponseEntity.ok(wishlistService.getWishlist());
    }
    
    @PostMapping("/add/{productId}")
    public ResponseEntity<WishlistDto> addToWishlist(@PathVariable Long productId) {
        return ResponseEntity.ok(wishlistService.addToWishlist(productId));
    }
    
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> removeFromWishlist(@PathVariable Long id) {
        wishlistService.removeFromWishlist(id);
        return ResponseEntity.noContent().build();
    }
}


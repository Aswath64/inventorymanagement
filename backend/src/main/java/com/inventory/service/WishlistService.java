package com.inventory.service;

import com.inventory.dto.WishlistDto;
import com.inventory.entity.Product;
import com.inventory.entity.User;
import com.inventory.entity.Wishlist;
import com.inventory.repository.ProductRepository;
import com.inventory.repository.UserRepository;
import com.inventory.repository.WishlistRepository;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class WishlistService {
    
    private final WishlistRepository wishlistRepository;
    private final ProductRepository productRepository;
    private final UserRepository userRepository;
    
    public WishlistService(WishlistRepository wishlistRepository, ProductRepository productRepository, UserRepository userRepository) {
        this.wishlistRepository = wishlistRepository;
        this.productRepository = productRepository;
        this.userRepository = userRepository;
    }
    
    private User getCurrentUser() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String email = authentication.getName();
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));
    }
    
    public List<WishlistDto> getWishlist() {
        User user = getCurrentUser();
        List<Wishlist> wishlistItems = wishlistRepository.findByUser(user);
        return wishlistItems.stream().map(this::toDto).collect(Collectors.toList());
    }
    
    @Transactional
    public WishlistDto addToWishlist(Long productId) {
        User user = getCurrentUser();
        Product product = productRepository.findById(productId)
                .orElseThrow(() -> new RuntimeException("Product not found"));
        
        if (wishlistRepository.findByUserAndProductId(user, productId).isPresent()) {
            throw new RuntimeException("Product already in wishlist");
        }
        
        Wishlist wishlist = new Wishlist();
        wishlist.setUser(user);
        wishlist.setProduct(product);
        wishlist = wishlistRepository.save(wishlist);
        
        return toDto(wishlist);
    }
    
    @Transactional
    public void removeFromWishlist(Long wishlistId) {
        User user = getCurrentUser();
        Wishlist wishlist = wishlistRepository.findById(wishlistId)
                .orElseThrow(() -> new RuntimeException("Wishlist item not found"));
        
        if (!wishlist.getUser().getId().equals(user.getId())) {
            throw new RuntimeException("Unauthorized");
        }
        
        wishlistRepository.delete(wishlist);
    }
    
    private WishlistDto toDto(Wishlist wishlist) {
        Product product = wishlist.getProduct();
        String productImage = product.getImages().isEmpty() ? null : product.getImages().get(0).getImageUrl();
        
        return new WishlistDto(
                wishlist.getId(),
                product.getId(),
                product.getName(),
                product.getPrice(),
                productImage,
                wishlist.getCreatedAt()
        );
    }
}


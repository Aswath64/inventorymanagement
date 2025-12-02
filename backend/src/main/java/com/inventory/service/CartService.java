package com.inventory.service;

import com.inventory.dto.AddToCartRequest;
import com.inventory.dto.CartDto;
import com.inventory.dto.UpdateCartRequest;
import com.inventory.entity.Cart;
import com.inventory.entity.Product;
import com.inventory.entity.User;
import com.inventory.repository.CartRepository;
import com.inventory.repository.ProductRepository;
import com.inventory.repository.UserRepository;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class CartService {
    
    private final CartRepository cartRepository;
    private final ProductRepository productRepository;
    private final UserRepository userRepository;
    
    public CartService(CartRepository cartRepository, ProductRepository productRepository, UserRepository userRepository) {
        this.cartRepository = cartRepository;
        this.productRepository = productRepository;
        this.userRepository = userRepository;
    }
    
    private User getCurrentUser() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String email = authentication.getName();
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));
    }
    
    public List<CartDto> getCart() {
        User user = getCurrentUser();
        List<Cart> cartItems = cartRepository.findByUser(user);
        return cartItems.stream().map(this::toDto).collect(Collectors.toList());
    }
    
    @Transactional
    public CartDto addToCart(AddToCartRequest request) {
        User user = getCurrentUser();
        Product product = productRepository.findById(request.getProductId())
                .orElseThrow(() -> new RuntimeException("Product not found"));
        
        if (product.getStock() < request.getQuantity()) {
            throw new RuntimeException("Insufficient stock");
        }
        
        Cart cart = cartRepository.findByUserAndProductId(user, request.getProductId())
                .orElse(null);
        
        if (cart != null) {
            cart.setQuantity(cart.getQuantity() + request.getQuantity());
        } else {
            cart = new Cart();
            cart.setUser(user);
            cart.setProduct(product);
            cart.setQuantity(request.getQuantity());
        }
        
        cart = cartRepository.save(cart);
        return toDto(cart);
    }
    
    @Transactional
    public CartDto updateCart(Long cartId, UpdateCartRequest request) {
        User user = getCurrentUser();
        Cart cart = cartRepository.findById(cartId)
                .orElseThrow(() -> new RuntimeException("Cart item not found"));
        
        if (!cart.getUser().getId().equals(user.getId())) {
            throw new RuntimeException("Unauthorized");
        }
        
        if (cart.getProduct().getStock() < request.getQuantity()) {
            throw new RuntimeException("Insufficient stock");
        }
        
        cart.setQuantity(request.getQuantity());
        cart = cartRepository.save(cart);
        return toDto(cart);
    }
    
    @Transactional
    public void removeFromCart(Long cartId) {
        User user = getCurrentUser();
        Cart cart = cartRepository.findById(cartId)
                .orElseThrow(() -> new RuntimeException("Cart item not found"));
        
        if (!cart.getUser().getId().equals(user.getId())) {
            throw new RuntimeException("Unauthorized");
        }
        
        cartRepository.delete(cart);
    }
    
    @Transactional
    public void clearCart() {
        User user = getCurrentUser();
        cartRepository.deleteByUser(user);
    }
    
    private CartDto toDto(Cart cart) {
        Product product = cart.getProduct();
        String productImage = product.getImages().isEmpty() ? null : product.getImages().get(0).getImageUrl();
        BigDecimal subtotal = product.getPrice().multiply(BigDecimal.valueOf(cart.getQuantity()));
        
        return new CartDto(
                cart.getId(),
                product.getId(),
                product.getName(),
                product.getPrice(),
                productImage,
                cart.getQuantity(),
                subtotal
        );
    }
}


package com.inventory.controller;

import com.inventory.dto.AddToCartRequest;
import com.inventory.dto.CartDto;
import com.inventory.dto.UpdateCartRequest;
import com.inventory.service.CartService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/customer/cart")
@CrossOrigin(origins = "*")
@PreAuthorize("hasRole('CUSTOMER')")
public class CartController {
    
    private final CartService cartService;
    
    public CartController(CartService cartService) {
        this.cartService = cartService;
    }
    
    @GetMapping
    public ResponseEntity<List<CartDto>> getCart() {
        return ResponseEntity.ok(cartService.getCart());
    }
    
    @PostMapping("/add")
    public ResponseEntity<CartDto> addToCart(@Valid @RequestBody AddToCartRequest request) {
        return ResponseEntity.ok(cartService.addToCart(request));
    }
    
    @PutMapping("/{id}")
    public ResponseEntity<CartDto> updateCart(@PathVariable Long id, @Valid @RequestBody UpdateCartRequest request) {
        return ResponseEntity.ok(cartService.updateCart(id, request));
    }
    
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> removeFromCart(@PathVariable Long id) {
        cartService.removeFromCart(id);
        return ResponseEntity.noContent().build();
    }
}


package com.inventory.repository;

import com.inventory.entity.Category;
import com.inventory.entity.Product;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.util.List;

@Repository
public interface ProductRepository extends JpaRepository<Product, Long> {
    Page<Product> findByCategory(Category category, Pageable pageable);
    
    @Query("SELECT p FROM Product p WHERE " +
           "(:name IS NULL OR LOWER(p.name) LIKE LOWER(CONCAT('%', :name, '%'))) AND " +
           "(:categoryId IS NULL OR p.category.id = :categoryId) AND " +
           "(:minPrice IS NULL OR p.price >= :minPrice) AND " +
           "(:maxPrice IS NULL OR p.price <= :maxPrice) AND " +
           "(:active IS NULL OR p.active = :active)")
    Page<Product> searchProducts(@Param("name") String name,
                                  @Param("categoryId") Long categoryId,
                                  @Param("minPrice") BigDecimal minPrice,
                                  @Param("maxPrice") BigDecimal maxPrice,
                                  @Param("active") Boolean active,
                                  Pageable pageable);
    
    List<Product> findByStockLessThan(Integer stock);
    
    @Query("SELECT p FROM Product p ORDER BY " +
           "(SELECT COUNT(oi) FROM OrderItem oi WHERE oi.product = p) DESC")
    Page<Product> findMostSoldProducts(Pageable pageable);
}


package com.portfolio.financeoptimizer.repository;

import com.portfolio.financeoptimizer.model.Transaction;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface TransactionRepository extends JpaRepository<Transaction, Long> {
    // Spring Data JPA automatically creates Save, Delete, and Find methods for us!
}
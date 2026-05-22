package com.portfolio.financeoptimizer.controller;

import com.portfolio.financeoptimizer.model.Transaction;
import com.portfolio.financeoptimizer.model.TransactionCategory;
import com.portfolio.financeoptimizer.repository.TransactionRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;
import org.springframework.http.ResponseEntity;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/transactions")
@CrossOrigin(origins = "http://localhost:5173")
public class TransactionController {

    @Autowired
    private TransactionRepository transactionRepository;

    // 1. GET ALL TRANSACTIONS: http://localhost:8080/api/transactions
    @GetMapping
    public List<Transaction> getAllTransactions() {
        return transactionRepository.findAll();
    }

    // 2. CREATE A NEW TRANSACTION: http://localhost:8080/api/transactions
    @PostMapping
    public Transaction createTransaction(@RequestBody Transaction transaction) {
        return transactionRepository.save(transaction);
    }
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteTransaction(@PathVariable Long id) {
        if (!transactionRepository.existsById(id)) {
            return ResponseEntity.notFound().build();
        }
        transactionRepository.deleteById(id);
        return ResponseEntity.ok().build();
    }

    // 3. GET BUDGET METRICS REPORT: http://localhost:8080/api/transactions/report
    @GetMapping("/report")
    public Map<String, Object> getBudgetReport() {
        List<Transaction> transactions = transactionRepository.findAll();

        double totalNeeds = 0;
        double totalWants = 0;
        double totalSavings = 0;

        for (Transaction t : transactions) {
            if (t.getCategory() == TransactionCategory.NEED) {
                totalNeeds += t.getAmount();
            } else if (t.getCategory() == TransactionCategory.WANT) {
                totalWants += t.getAmount();
            } else if (t.getCategory() == TransactionCategory.SAVINGS) {
                totalSavings += t.getAmount();
            }
        }

        double totalSpending = totalNeeds + totalWants + totalSavings;

        Map<String, Object> report = new HashMap<>();
        report.put("totalTransactions", transactions.size());
        report.put("totalSpending", totalSpending);

        if (totalSpending > 0) {
            report.put("needsPercentage", Math.round((totalNeeds / totalSpending) * 100));
            report.put("wantsPercentage", Math.round((totalWants / totalSpending) * 100));
            report.put("savingsPercentage", Math.round((totalSavings / totalSpending) * 100));
        } else {
            report.put("needsPercentage", 0);
            report.put("wantsPercentage", 0);
            report.put("savingsPercentage", 0);
        }

        return report;
    }
}
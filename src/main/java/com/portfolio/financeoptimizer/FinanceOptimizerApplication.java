package com.portfolio.financeoptimizer;

import com.portfolio.financeoptimizer.repository.TransactionRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.context.annotation.Bean;

@SpringBootApplication
public class FinanceOptimizerApplication {

    public static void main(String[] args) {
        SpringApplication.run(FinanceOptimizerApplication.class, args);
    }

    @Bean
    public CommandLineRunner demoData(TransactionRepository repository) {
        return (args) -> {
            // Keep a clean startup log without generating mock data rows
            System.out.println("\n>>> FinanceOptimizer Backend Engine Sourced Successfully! ready for live REST API entry streams. <<<\n");
        };
    }
}
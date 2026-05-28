package com.example.todolist.repository;

import com.example.todolist.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface UserRepository extends JpaRepository<User, Long> {

    // Spring Data JPA сам напишет SQL-запрос для поиска пользователя по имени
    Optional<User> findByUsername(String username);

    // И метод для проверки, существует ли уже такой логин
    boolean existsByUsername(String username);
}
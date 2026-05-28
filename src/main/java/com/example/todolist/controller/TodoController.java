package com.example.todolist.controller;

import com.example.todolist.model.Todo;
import com.example.todolist.repository.TodoRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.web.bind.annotation.*;
import jakarta.validation.Valid;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import java.util.List;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.cache.annotation.CacheEvict;

@RestController
@RequestMapping("/api/todos")
@CrossOrigin(origins = "*")
public class TodoController {

    private static final Logger logger = LoggerFactory.getLogger(TodoController.class);

    @Autowired
    private TodoRepository repository;

    // Сохраняем результат в кэш с именем "todos"
    @GetMapping
    @Cacheable(value = "todos")
    public List<Todo> getAllTodos() {
        logger.info("Запрос списка задач из базы данных (если видишь это часто - кэш не работает)");
        return repository.findAll();
    }

    // При добавлении очищаем кэш "todos", чтобы в следующий раз загрузился свежий список
    @PostMapping
    @CacheEvict(value = "todos", allEntries = true)
    public Todo createTodo(@Valid @RequestBody Todo todo) {
        logger.info("Пользователь создал новую задачу: {}", todo.getTitle());
        Todo savedTodo = repository.save(todo); // Сначала сохраняем в базу
        messagingTemplate.convertAndSend("/topic/todos", "UPDATE"); // Затем трубим во все трубы
        return savedTodo;
    }

    @Autowired
    private SimpMessagingTemplate messagingTemplate;

    // При обновлении тоже очищаем кэш
    @PutMapping("/{id}")
    @CacheEvict(value = "todos", allEntries = true)
    public ResponseEntity<Todo> updateTodo(@PathVariable Long id, @RequestBody Todo todoDetails) {
        Todo todo = repository.findById(id).orElseThrow();
        todo.setTitle(todoDetails.getTitle());
        todo.setCompleted(todoDetails.isCompleted());
        Todo updatedTodo = repository.save(todo);

        messagingTemplate.convertAndSend("/topic/todos", "UPDATE"); // Добавили сигнал!

        return ResponseEntity.ok(updatedTodo);
    }

    // И при удалении очищаем кэш
    @DeleteMapping("/{id}")
    @CacheEvict(value = "todos", allEntries = true)
    public ResponseEntity<Void> deleteTodo(@PathVariable Long id) {
        logger.warn("Пользователь удалил задачу с ID: {}", id);
        repository.deleteById(id);

        messagingTemplate.convertAndSend("/topic/todos", "UPDATE"); // Добавили сигнал!

        return ResponseEntity.noContent().build();
    }
}
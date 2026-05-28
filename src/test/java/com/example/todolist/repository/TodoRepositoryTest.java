package com.example.todolist.repository;

import com.example.todolist.model.Todo;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;

import static org.junit.jupiter.api.Assertions.*;

@SpringBootTest
public class TodoRepositoryTest {

    @Autowired
    private TodoRepository repository;

    @Test
    public void testAddAndRemoveTodo() {
        // 1. Тестируем добавление заметки
        Todo todo = new Todo("Подготовить отчет по контрольной");
        Todo savedTodo = repository.save(todo);

        // Проверяем, что она сохранилась и получила ID в MySQL
        assertNotNull(savedTodo.getId());
        assertEquals("Подготовить отчет по контрольной", savedTodo.getTitle());

        // 2. Тестируем удаление заметки
        repository.deleteById(savedTodo.getId());

        // Проверяем, что её больше нет в базе
        boolean exists = repository.existsById(savedTodo.getId());
        assertFalse(exists);
    }
}


package com.example.todolist.controller;

import com.example.todolist.model.Feedback;
import com.example.todolist.repository.FeedbackRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;
import jakarta.validation.Valid;

@RestController
@RequestMapping("/api/feedback")
@CrossOrigin(origins = "*")
public class FeedbackController {

    @Autowired
    private FeedbackRepository repository;

    @PostMapping
    public Feedback submitFeedback(@Valid @RequestBody Feedback feedback) {
        return repository.save(feedback);
    }
}
import { getToken } from './authService';

const API_URL = 'http://localhost:8080/api/todos';

// Функция помощник для генерации заголовков с токеном
const getHeaders = () => {
    const headers = { 'Content-Type': 'application/json' };
    const token = getToken();
    if (token) {
        headers['Authorization'] = `Bearer ${token}`; // Прикрепляем наш пропуск!
    }
    return headers;
};

export const getTodos = async () => {
    const response = await fetch(API_URL); // GET-запрос мы оставили открытым для всех
    if (!response.ok) throw new Error('Network response was not ok');
    return response.json();
};

export const createTodo = async (todo) => {
    const response = await fetch(API_URL, {
        method: 'POST',
        headers: getHeaders(), // Используем заголовки с токеном
        body: JSON.stringify(todo),
    });
    if (!response.ok) throw new Error('Error creating todo');
    return response.json();
};

export const updateTodo = async (id, todo) => {
    const response = await fetch(`${API_URL}/${id}`, {
        method: 'PUT',
        headers: getHeaders(), // Используем заголовки с токеном
        body: JSON.stringify(todo),
    });
    if (!response.ok) throw new Error('Error updating todo');
    return response.json();
};

export const deleteTodo = async (id) => {
    const response = await fetch(`${API_URL}/${id}`, {
        method: 'DELETE',
        headers: getHeaders(), // Используем заголовки с токеном
    });
    if (!response.ok) throw new Error('Error deleting todo');
};

// Функция для отправки отзывов
export const submitFeedback = async (feedback) => {
    // Обрати внимание: здесь другой URL (/api/feedback)
    const response = await fetch('http://localhost:8080/api/feedback', {
        method: 'POST',
        headers: getHeaders(), // Отправляем с теми же заголовками
        body: JSON.stringify(feedback),
    });
    if (!response.ok) throw new Error('Error submitting feedback');
    return response.json();
};
const API_URL = 'http://localhost:8080/api/auth';

export const register = async (username, password) => {
    const response = await fetch(`${API_URL}/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password })
    });
    if (!response.ok) {
        throw new Error('Ошибка регистрации. Возможно, логин уже занят.');
    }
    return response.text();
};

export const login = async (username, password) => {
    const response = await fetch(`${API_URL}/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password })
    });
    if (!response.ok) {
        throw new Error('Неверный логин или пароль');
    }
    const data = await response.json();
    if (data.token) {
        localStorage.setItem('jwtToken', data.token); // Сохраняем токен в браузере
    }
    return data;
};

export const logout = () => {
    localStorage.removeItem('jwtToken'); // Удаляем токен при выходе
};

export const getToken = () => {
    return localStorage.getItem('jwtToken'); // Достаем токен для отправки на сервер
};
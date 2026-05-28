import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { motion, AnimatePresence } from 'framer-motion';
import { Client } from '@stomp/stompjs';
import SockJS from 'sockjs-client';
import { jwtDecode } from 'jwt-decode'; // <-- ИМПОРТ ДЛЯ ЧТЕНИЯ ТОКЕНА
import './App.css';
import * as todoService from './api/todoService';
import * as authService from './api/authService';
import TodoForm from './components/TodoForm';
import FeedbackForm from './components/FeedbackForm';
import AuthForm from './components/AuthForm';

function App() {
  const { t, i18n } = useTranslation();
  const [todos, setTodos] = useState([]);
  const [editingId, setEditingId] = useState(null);
  const [editText, setEditText] = useState('');

  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [currentUser, setCurrentUser] = useState(''); // <-- СОСТОЯНИЕ ДЛЯ ИМЕНИ ПОЛЬЗОВАТЕЛЯ

  // 1. Проверяем токен при загрузке страницы
  useEffect(() => {
    const token = authService.getToken();
    if (token) {
      setIsAuthenticated(true);
      try {
        const decoded = jwtDecode(token);
        setCurrentUser(decoded.sub); // Достаем логин из токена!
      } catch (e) {
        console.error("Ошибка чтения токена", e);
      }
    }
  }, []);

  // 2. Проверяем язык
  useEffect(() => {
    const savedLang = localStorage.getItem('appLanguage');
    if (savedLang) i18n.changeLanguage(savedLang);
  }, [i18n]);

  // 3. Загружаем задачи, если вошли
  useEffect(() => {
    if (isAuthenticated) fetchTodos();
  }, [isAuthenticated]);

  // 4. WebSockets
  useEffect(() => {
    if (!isAuthenticated) return;
    const client = new Client({
      webSocketFactory: () => new SockJS('http://localhost:8080/ws'),
      onConnect: () => {
        client.subscribe('/topic/todos', (message) => {
          if (message.body === 'UPDATE') fetchTodos();
        });
      },
    });
    client.activate();
    return () => { client.deactivate(); };
  }, [isAuthenticated]);

  const fetchTodos = async () => {
    try {
      const data = await todoService.getTodos();
      setTodos(data);
    } catch (error) {
      if (error.message.includes('403') || error.message.includes('401')) handleLogout();
    }
  };

  const handleLogout = () => {
    authService.logout();
    setIsAuthenticated(false);
    setTodos([]);
    setCurrentUser(''); // Очищаем имя при выходе
  };

  // Метод, который срабатывает при успешном логине
  const handleLoginSuccess = () => {
    setIsAuthenticated(true);
    const token = authService.getToken();
    if (token) {
      try {
        const decoded = jwtDecode(token);
        setCurrentUser(decoded.sub);
      } catch (e) {
        console.error("Ошибка чтения токена", e);
      }
    }
  };

  const handleAddTodo = async (newTodo) => {
    try { await todoService.createTodo(newTodo); }
    catch (error) { console.error("Ошибка:", error); }
  };

  const handleToggleComplete = async (todo) => {
    try { await todoService.updateTodo(todo.id, { ...todo, completed: !todo.completed }); }
    catch (error) { console.error("Ошибка:", error); }
  };

  const handleDelete = async (id) => {
    try { await todoService.deleteTodo(id); }
    catch (error) { console.error("Ошибка:", error); }
  };

  const startEditing = (todo) => {
    setEditingId(todo.id);
    setEditText(todo.title);
  };

  const saveEdit = async (id, originalTodo) => {
    if (!editText.trim()) return;
    try {
      await todoService.updateTodo(id, { ...originalTodo, title: editText });
      setEditingId(null);
      setEditText('');
    } catch (error) { console.error("Ошибка:", error); }
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditText('');
  };

  const toggleLanguage = () => {
    const newLang = i18n.language === 'ru' ? 'en' : 'ru';
    i18n.changeLanguage(newLang);
    localStorage.setItem('appLanguage', newLang);
  };

  if (!isAuthenticated) {
    return (
        <div className="app-container">
          <AuthForm onLoginSuccess={handleLoginSuccess} />
        </div>
    );
  }

  return (
      <div className="app-container">
        {/* Панель пользователя (слева сверху) */}
        <div style={{ position: 'absolute', top: '25px', left: '25px', display: 'flex', gap: '15px', alignItems: 'center' }}>
          <span style={{ color: '#94a3b8', fontSize: '16px', fontWeight: 'bold' }}>
            👤 {currentUser}
          </span>
          <button onClick={handleLogout} className="lang-btn" style={{ position: 'static', color: '#ef4444', borderColor: 'rgba(239, 68, 68, 0.2)' }}>
            🚪 {i18n.language === 'ru' ? 'Выйти' : 'Logout'}
          </button>
        </div>

        <button onClick={toggleLanguage} className="lang-btn">
          {t('lang_btn')}
        </button>

        <h1 style={{ marginTop: '40px' }}>{t('title')}</h1>

        <TodoForm onAdd={handleAddTodo} />

        <div className="todo-list">
          {todos.length === 0 ? (
              <p style={{ textAlign: 'center', color: '#64748b' }}>{t('empty_msg')}</p>
          ) : (
              <AnimatePresence>
                {todos.map((todo) => (
                    <motion.div key={todo.id} initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, x: -100 }} transition={{ duration: 0.3 }} className="todo-item">
                      <div className="todo-content" style={{ flex: 1 }}>
                        {editingId === todo.id ? (
                            <div style={{ display: 'flex', gap: '8px', width: '100%' }}>
                              <input type="text" value={editText} onChange={(e) => setEditText(e.target.value)} className="todo-input" style={{ padding: '8px 12px', fontSize: '14px', flex: 1 }} autoFocus />
                              <button onClick={() => saveEdit(todo.id, todo)} className="todo-button" style={{ padding: '8px 12px' }}>✅</button>
                              <button onClick={cancelEdit} className="delete-btn" style={{ padding: '8px 12px', border: 'none' }}>❌</button>
                            </div>
                        ) : (
                            <>
                              <input type="checkbox" className="todo-checkbox" checked={todo.completed} onChange={() => handleToggleComplete(todo)} />
                              <span className={`todo-text ${todo.completed ? 'completed' : ''}`}>{todo.title}</span>
                            </>
                        )}
                      </div>
                      {editingId !== todo.id && (
                          <div style={{ display: 'flex', gap: '8px' }}>
                            <button onClick={() => startEditing(todo)} className="delete-btn" style={{ color: '#38bdf8', borderColor: 'rgba(56, 189, 248, 0.2)' }}>✏️</button>
                            <button onClick={() => handleDelete(todo.id)} className="delete-btn">{t('delete_btn')}</button>
                          </div>
                      )}
                    </motion.div>
                ))}
              </AnimatePresence>
          )}
        </div>
        <FeedbackForm />
      </div>
  );
}

export default App;
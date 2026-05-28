import React, { useState } from 'react';
import { useTranslation } from 'react-i18next'; // <-- Импортируем i18n
import * as authService from '../api/authService';

const AuthForm = ({ onLoginSuccess }) => {
    // Подключаем функцию перевода и объект текущего языка (i18n)
    const { t, i18n } = useTranslation();
    const [isLoginMode, setIsLoginMode] = useState(true);
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');

    // Функция смены языка прямо внутри формы
    const toggleLanguage = () => {
        const newLang = i18n.language === 'ru' ? 'en' : 'ru';
        i18n.changeLanguage(newLang);
        localStorage.setItem('appLanguage', newLang);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        if (!username || !password) {
            setError(t('auth_error_empty'));
            return;
        }

        try {
            if (isLoginMode) {
                await authService.login(username, password);
                onLoginSuccess();
            } else {
                await authService.register(username, password);
                await authService.login(username, password);
                onLoginSuccess();
            }
        } catch (err) {
            setError(err.message);
        }
    };

    return (
        // Добавили position: 'relative' для правильного позиционирования кнопки внутри
        <div className="todo-item" style={{ position: 'relative', flexDirection: 'column', alignItems: 'stretch', padding: '40px 30px 30px', maxWidth: '400px', margin: '0 auto', marginTop: '50px' }}>

            {/* Наша аккуратная кнопка перевода в правом верхнем углу карточки */}
            <button
                onClick={toggleLanguage}
                style={{ position: 'absolute', top: '15px', right: '15px', background: 'rgba(255, 255, 255, 0.05)', border: '1px solid rgba(255, 255, 255, 0.1)', color: '#94a3b8', padding: '4px 10px', borderRadius: '8px', cursor: 'pointer', fontSize: '12px' }}
            >
                {i18n.language === 'ru' ? 'English' : 'Русский'}
            </button>

            <h2 style={{ textAlign: 'center', marginBottom: '20px', color: '#f8fafc' }}>
                {isLoginMode ? t('auth_login_title') : t('auth_register_title')}
            </h2>

            {error && <div style={{ color: '#ef4444', backgroundColor: 'rgba(239, 68, 68, 0.1)', padding: '10px', borderRadius: '8px', marginBottom: '15px', textAlign: 'center', fontSize: '14px' }}>{error}</div>}

            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                <input
                    type="text"
                    placeholder={t('auth_username_placeholder')}
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    className="todo-input"
                    style={{ fontSize: '16px' }}
                />
                <input
                    type="password"
                    placeholder={t('auth_password_placeholder')}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="todo-input"
                    style={{ fontSize: '16px' }}
                />
                <button type="submit" className="todo-button" style={{ width: '100%', padding: '12px', fontSize: '16px', marginTop: '10px' }}>
                    {isLoginMode ? t('auth_login_btn') : t('auth_register_btn')}
                </button>
            </form>

            <div style={{ textAlign: 'center', marginTop: '20px', fontSize: '14px', color: '#94a3b8' }}>
                {isLoginMode ? t('auth_no_account') : t('auth_has_account')}
                <span
                    onClick={() => setIsLoginMode(!isLoginMode)}
                    style={{ color: '#38bdf8', cursor: 'pointer', textDecoration: 'underline' }}
                >
                    {isLoginMode ? t('auth_register_link') : t('auth_login_link')}
                </span>
            </div>
        </div>
    );
};

export default AuthForm;
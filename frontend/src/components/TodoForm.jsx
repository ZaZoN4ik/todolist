import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';

const TodoForm = ({ onAdd }) => {
    const { t } = useTranslation();
    const [title, setTitle] = useState('');
    const [error, setError] = useState(''); // Сюда теперь будем класть ключ, а не текст

    const handleSubmit = (e) => {
        e.preventDefault();

        if (!title.trim()) {
            // Сохраняем просто ключ-идентификатор ошибки
            setError('error_empty');
            return;
        }

        onAdd({ title: title, completed: false });
        setTitle('');
        setError(''); // Очищаем ошибку при успешном добавлении
    };

    // Очищаем ошибку, как только пользователь начинает печатать новый текст
    const handleInputChange = (e) => {
        setTitle(e.target.value);
        if (error) setError('');
    };

    return (
        <form onSubmit={handleSubmit} className="todo-form">
            <input
                type="text"
                placeholder={t('placeholder')}
                value={title}
                onChange={handleInputChange}
                className="todo-input"
            />
            <button type="submit" className="todo-button">{t('add_btn')}</button>

            {/* А вот здесь мы переводим ключ "error_empty" на лету! */}
            {error && <p className="error-text" style={{ color: 'red' }}>{t(error)}</p>}
        </form>
    );
};

export default TodoForm;
import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { submitFeedback } from '../api/todoService';

const FeedbackForm = () => {
    const { t } = useTranslation();
    const [message, setMessage] = useState('');
    const [submitted, setSubmitted] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!message.trim()) return;

        try {
            await submitFeedback({ message });
            setSubmitted(true);
            setMessage('');
            setTimeout(() => setSubmitted(false), 3000);
        } catch (error) {
            console.error("Ошибка при отправке отзыва:", error);
        }
    };

    return (
        <div className="feedback-section">
            {submitted ? (
                <p style={{ color: '#10b981', textAlign: 'center', fontWeight: 'bold' }}>
                    {t('feedback_success')}
                </p>
            ) : (
                <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                    <textarea
                        value={message}
                        onChange={(e) => setMessage(e.target.value)}
                        placeholder={t('feedback_placeholder')}
                        className="feedback-textarea"
                    />
                    <button type="submit" className="todo-button feedback-btn" style={{ alignSelf: 'flex-end' }}>
                        {t('feedback_send')}
                    </button>
                </form>
            )}
        </div>
    );
};

export default FeedbackForm;
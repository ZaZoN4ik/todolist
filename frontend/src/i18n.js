import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

const resources = {ru: {
        translation: {
            "title": "Мой To-Do List",
            "placeholder": "Что нужно сделать?",
            "add_btn": "Добавить",
            "empty_msg": "Задач пока нет. Добавьте первую!",
            "delete_btn": "Удалить",
            "lang_btn": "English",
            "error_empty": "Текст заметки не может быть пустым",
            "feedback_placeholder": "Напишите отзыв или предложение...",
            "feedback_send": "Отправить отзыв",
            "feedback_success": "Спасибо за ваш отзыв!",
            "auth_login_title": "Вход в систему",
            "auth_register_title": "Регистрация",
            "auth_error_empty": "Пожалуйста, заполните все поля",
            "auth_username_placeholder": "Логин",
            "auth_password_placeholder": "Пароль",
            "auth_login_btn": "Войти",
            "auth_register_btn": "Зарегистрироваться",
            "auth_no_account": "Нет аккаунта? ",
            "auth_has_account": "Уже есть аккаунт? ",
            "auth_register_link": "Зарегистрируйтесь",
            "auth_login_link": "Войдите"
        }
    },
    en: {
        translation: {
            "title": "My To-Do List",
            "placeholder": "What needs to be done?",
            "add_btn": "Add",
            "empty_msg": "No tasks yet. Add your first one!",
            "delete_btn": "Delete",
            "lang_btn": "Русский",
            "error_empty": "Task text cannot be empty",
            "feedback_placeholder": "Write your feedback or suggestion...",
            "feedback_send": "Submit feedback",
            "feedback_success": "Thank you for your feedback!",
            "auth_login_title": "Sign In",
            "auth_register_title": "Sign Up",
            "auth_error_empty": "Please fill in all fields",
            "auth_username_placeholder": "Username",
            "auth_password_placeholder": "Password",
            "auth_login_btn": "Login",
            "auth_register_btn": "Register",
            "auth_no_account": "Don't have an account? ",
            "auth_has_account": "Already have an account? ",
            "auth_register_link": "Sign Up",
            "auth_login_link": "Sign In"
        }
    }
};

i18n
    .use(initReactI18next)
    .init({
        resources,
        lng: "ru",
        interpolation: {
            escapeValue: false
        }
    });

export default i18n;
import React, { useState, useEffect, useCallback } from 'react';
import { StyleSheet, Text, View, TextInput, TouchableOpacity, FlatList, Alert, RefreshControl } from 'react-native';
import { Client } from '@stomp/stompjs';
import SockJS from 'sockjs-client';
import AsyncStorage from '@react-native-async-storage/async-storage'; // ✨ ИМПОРТИРОВАЛИ ПАМЯТЬ ✨

// 🔴 ТВОЙ IP-АДРЕС 🔴
const SERVER_IP = '192.168.0.101';
const API_URL = `http://${SERVER_IP}:8080/api`;

const translations = {
  ru: {
    appTitle: 'Вход в систему',
    registerTitle: 'Регистрация',
    login: 'Логин',
    password: 'Пароль',
    loginBtn: 'Войти',
    registerBtn: 'Зарегистрироваться',
    noAccount: 'Нет аккаунта? ',
    hasAccount: 'Уже есть аккаунт? ',
    registerLink: 'Зарегистрируйтесь',
    loginLink: 'Войдите',
    myTasks: 'Мои задачи',
    whatToDo: 'Что нужно сделать?',
    logoutBtn: '🚪 Выйти',
    deleteBtn: 'Удалить',
    emptyMsg: 'Задач пока нет. Добавьте первую!',
    feedbackPlaceholder: 'Напишите отзыв или предложение...',
    feedbackSend: 'Отправить отзыв',
    feedbackSuccess: 'Спасибо за ваш отзыв!',
    error: 'Ошибка',
    loginError: 'Неверный логин или пароль',
    regError: 'Ошибка регистрации. Возможно, логин занят.',
    addError: 'Не удалось добавить задачу'
  },
  en: {
    appTitle: 'Sign In',
    registerTitle: 'Sign Up',
    login: 'Username',
    password: 'Password',
    loginBtn: 'Login',
    registerBtn: 'Register',
    noAccount: "Don't have an account? ",
    hasAccount: 'Already have an account? ',
    registerLink: 'Sign Up',
    loginLink: 'Sign In',
    myTasks: 'My Tasks',
    whatToDo: 'What needs to be done?',
    logoutBtn: '🚪 Logout',
    deleteBtn: 'Delete',
    emptyMsg: 'No tasks yet. Add your first one!',
    feedbackPlaceholder: 'Write your feedback or suggestion...',
    feedbackSend: 'Submit feedback',
    feedbackSuccess: 'Thank you for your feedback!',
    error: 'Error',
    loginError: 'Invalid username or password',
    regError: 'Registration error. Username might be taken.',
    addError: 'Failed to add task'
  }
};

export default function App() {
  const [token, setToken] = useState<string | null>(null);
  const [currentUser, setCurrentUser] = useState<string>('');

  const [isLoginMode, setIsLoginMode] = useState(true);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  const [todos, setTodos] = useState<any[]>([]);
  const [newTodo, setNewTodo] = useState('');
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editText, setEditText] = useState('');

  const [feedback, setFeedback] = useState('');
  const [refreshing, setRefreshing] = useState(false);
  const [lang, setLang] = useState<'ru' | 'en'>('ru');
  const t = translations[lang];

  // ✨ ЗАГРУЗКА ПРИ СТАРТЕ ПРИЛОЖЕНИЯ ✨
  useEffect(() => {
    const loadData = async () => {
      try {
        const savedToken = await AsyncStorage.getItem('userToken');
        const savedName = await AsyncStorage.getItem('userName');
        if (savedToken) {
          setToken(savedToken);
          setCurrentUser(savedName || '');
        }
      } catch (e) {
        console.log('Ошибка загрузки данных из памяти');
      }
    };
    loadData();
  }, []);

  useEffect(() => {
    if (token) fetchTodos();
  }, [token]);

  useEffect(() => {
    if (!token) return;
    const client = new Client({
      webSocketFactory: () => new SockJS(`http://${SERVER_IP}:8080/ws`),
      onConnect: () => {
        client.subscribe('/topic/todos', (message) => {
          if (message.body === 'UPDATE') fetchTodos();
        });
      },
    });
    client.activate();
    return () => { client.deactivate(); };
  }, [token]);

  const handleAuth = async () => {
    try {
      if (!isLoginMode) {
        const regResponse = await fetch(`${API_URL}/auth/register`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ username, password })
        });
        if (!regResponse.ok) throw new Error(t.regError);
      }

      const loginResponse = await fetch(`${API_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password })
      });
      if (!loginResponse.ok) throw new Error(t.loginError);

      const data = await loginResponse.json();

      // ✨ СОХРАНЯЕМ В ПАМЯТЬ ТЕЛЕФОНА ✨
      await AsyncStorage.setItem('userToken', data.token);
      await AsyncStorage.setItem('userName', username);

      setToken(data.token);
      setCurrentUser(username);

      setUsername('');
      setPassword('');
    } catch (error: any) {
      Alert.alert(t.error, error.message);
    }
  };

  const handleLogout = async () => {
    // ✨ УДАЛЯЕМ ИЗ ПАМЯТИ ПРИ ВЫХОДЕ ✨
    await AsyncStorage.removeItem('userToken');
    await AsyncStorage.removeItem('userName');
    setToken(null);
    setCurrentUser('');
    setTodos([]);
  };

  const fetchTodos = async () => {
    try {
      const response = await fetch(`${API_URL}/todos`);
      const data = await response.json();
      setTodos(data);
    } catch (error: any) {
      console.error(error);
    }
  };

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await fetchTodos();
    setRefreshing(false);
  }, []);

  const addTodo = async () => {
    if (!newTodo.trim()) return;
    try {
      const response = await fetch(`${API_URL}/todos`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ title: newTodo, completed: false })
      });
      if (response.ok) setNewTodo('');
    } catch (error: any) {
      Alert.alert(t.error, t.addError);
    }
  };

  const toggleTodo = async (todo: any) => {
    try {
      const updatedTodo = { ...todo, completed: !todo.completed };
      await fetch(`${API_URL}/todos/${todo.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify(updatedTodo)
      });
      fetchTodos();
    } catch (error: any) {
      console.error(error);
    }
  };

  const deleteTodo = async (id: number) => {
    try {
      await fetch(`${API_URL}/todos/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      fetchTodos();
    } catch (error: any) {
      console.error(error);
    }
  };

  const startEditing = (todo: any) => {
    setEditingId(todo.id);
    setEditText(todo.title);
  };

  const saveEdit = async (id: number, originalTodo: any) => {
    if (!editText.trim()) return;
    try {
      const updatedTodo = { ...originalTodo, title: editText };
      await fetch(`${API_URL}/todos/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify(updatedTodo)
      });
      setEditingId(null);
      setEditText('');
      fetchTodos();
    } catch (error: any) {
      console.error(error);
    }
  };

  const submitFeedback = async () => {
    if (!feedback.trim()) return;
    try {
      const response = await fetch(`${API_URL}/feedback`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ message: feedback })
      });

      const responseText = await response.text();

      if (response.ok) {
        Alert.alert('✅', t.feedbackSuccess);
        setFeedback('');
      } else {
        throw new Error(`Код: ${response.status}. Ответ: ${responseText}`);
      }
    } catch (error: any) {
      Alert.alert('Не удалось отправить отзыв', error.message);
    }
  };

  if (!token) {
    return (
        <View style={styles.authContainer}>
          <TouchableOpacity style={styles.langButton} onPress={() => setLang(lang === 'ru' ? 'en' : 'ru')}>
            <Text style={styles.langButtonText}>{lang === 'ru' ? 'English' : 'Русский'}</Text>
          </TouchableOpacity>

          <Text style={styles.header}>{isLoginMode ? t.appTitle : t.registerTitle}</Text>

          <TextInput
              style={styles.input}
              placeholder={t.login}
              placeholderTextColor="#64748b"
              value={username}
              onChangeText={setUsername}
              autoCapitalize="none"
          />
          <TextInput
              style={styles.input}
              placeholder={t.password}
              placeholderTextColor="#64748b"
              value={password}
              onChangeText={setPassword}
              secureTextEntry
          />

          <TouchableOpacity style={styles.button} onPress={handleAuth}>
            <Text style={styles.buttonText}>{isLoginMode ? t.loginBtn : t.registerBtn}</Text>
          </TouchableOpacity>

          <Text style={styles.switchModeText}>
            {isLoginMode ? t.noAccount : t.hasAccount}
            <Text style={styles.switchModeLink} onPress={() => setIsLoginMode(!isLoginMode)}>
              {isLoginMode ? t.registerLink : t.loginLink}
            </Text>
          </Text>
        </View>
    );
  }

  const renderFooter = () => (
      <View style={{ marginTop: 40, paddingBottom: 20 }}>
        <View style={styles.feedbackContainer}>
          <TextInput
              style={[styles.input, { height: 100, textAlignVertical: 'top', marginBottom: 10 }]}
              placeholder={t.feedbackPlaceholder}
              placeholderTextColor="#64748b"
              multiline
              value={feedback}
              onChangeText={setFeedback}
          />
          <TouchableOpacity style={[styles.button, { backgroundColor: '#10b981' }]} onPress={submitFeedback}>
            <Text style={styles.buttonText}>{t.feedbackSend}</Text>
          </TouchableOpacity>
        </View>

        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
          <Text style={styles.logoutButtonText}>{t.logoutBtn}</Text>
        </TouchableOpacity>
      </View>
  );

  return (
      <View style={styles.container}>
        <TouchableOpacity style={styles.langButton} onPress={() => setLang(lang === 'ru' ? 'en' : 'ru')}>
          <Text style={styles.langButtonText}>{lang === 'ru' ? 'English' : 'Русский'}</Text>
        </TouchableOpacity>

        <View style={styles.headerContainer}>
          <Text style={styles.header}>{t.myTasks}</Text>
          <Text style={styles.usernameText}>👤 {currentUser}</Text>
        </View>

        <View style={styles.addForm}>
          <TextInput
              style={[styles.input, { flex: 1, marginBottom: 0 }]}
              placeholder={t.whatToDo}
              placeholderTextColor="#64748b"
              value={newTodo}
              onChangeText={setNewTodo}
          />
          <TouchableOpacity style={[styles.button, { marginLeft: 10, paddingHorizontal: 20 }]} onPress={addTodo}>
            <Text style={styles.buttonText}>+</Text>
          </TouchableOpacity>
        </View>

        <FlatList
            data={todos}
            keyExtractor={(item) => item.id.toString()}
            showsVerticalScrollIndicator={false}
            ListEmptyComponent={<Text style={{textAlign: 'center', color: '#64748b', marginTop: 20}}>{t.emptyMsg}</Text>}
            ListFooterComponent={renderFooter}
            refreshControl={
              <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#38bdf8" />
            }
            renderItem={({ item }) => (
                <View style={styles.todoItem}>
                  {editingId === item.id ? (
                      <View style={{ flexDirection: 'row', flex: 1, gap: 8, alignItems: 'center' }}>
                        <TextInput
                            style={[styles.input, { flex: 1, marginBottom: 0, padding: 10 }]}
                            value={editText}
                            onChangeText={setEditText}
                            autoFocus
                        />
                        <TouchableOpacity onPress={() => saveEdit(item.id, item)} style={styles.iconBtn}><Text>✅</Text></TouchableOpacity>
                        <TouchableOpacity onPress={() => setEditingId(null)} style={styles.iconBtn}><Text>❌</Text></TouchableOpacity>
                      </View>
                  ) : (
                      <>
                        <TouchableOpacity style={{ flex: 1, flexDirection: 'row', alignItems: 'center' }} onPress={() => toggleTodo(item)}>
                          <Text style={{ fontSize: 16, color: item.completed ? '#10b981' : '#f8fafc', textDecorationLine: item.completed ? 'line-through' : 'none', flexShrink: 1 }}>
                            {item.completed ? '✅' : '⬜'} {item.title}
                          </Text>
                        </TouchableOpacity>

                        <View style={{ flexDirection: 'row', gap: 8, alignItems: 'center' }}>
                          <TouchableOpacity onPress={() => startEditing(item)} style={styles.iconBtn}>
                            <Text>✏️</Text>
                          </TouchableOpacity>
                          <TouchableOpacity onPress={() => deleteTodo(item.id)} style={styles.deleteBtn}>
                            <Text style={styles.deleteBtnText}>{t.deleteBtn}</Text>
                          </TouchableOpacity>
                        </View>
                      </>
                  )}
                </View>
            )}
        />
      </View>
  );
}

const styles = StyleSheet.create({
  authContainer: {
    flex: 1,
    backgroundColor: '#0f172a',
    padding: 25,
    justifyContent: 'center',
  },
  container: {
    flex: 1,
    backgroundColor: '#0f172a',
    padding: 20,
    paddingTop: 50,
  },
  headerContainer: {
    alignItems: 'center',
    marginBottom: 20,
    marginTop: 15,
  },
  header: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#38bdf8',
    textAlign: 'center',
    marginBottom: 20,
  },
  usernameText: {
    fontSize: 16,
    color: '#94a3b8',
    marginTop: -10,
    fontWeight: 'bold',
  },
  langButton: {
    position: 'absolute',
    top: 50,
    right: 20,
    padding: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
    zIndex: 10,
  },
  langButtonText: {
    color: '#94a3b8',
    fontSize: 12,
  },
  input: {
    backgroundColor: '#1e293b',
    color: '#f8fafc',
    padding: 15,
    borderRadius: 12,
    marginBottom: 15,
    fontSize: 16,
    borderWidth: 1,
    borderColor: '#334155',
  },
  button: {
    backgroundColor: '#3b82f6',
    padding: 15,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  switchModeText: {
    color: '#94a3b8',
    textAlign: 'center',
    marginTop: 20,
    fontSize: 14,
  },
  switchModeLink: {
    color: '#38bdf8',
    textDecorationLine: 'underline',
  },
  addForm: {
    flexDirection: 'row',
    marginBottom: 20,
  },
  todoItem: {
    backgroundColor: '#1e293b',
    padding: 15,
    borderRadius: 12,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#334155',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between'
  },
  iconBtn: {
    padding: 8,
    borderWidth: 1,
    borderColor: 'rgba(56, 189, 248, 0.2)',
    borderRadius: 6,
  },
  deleteBtn: {
    padding: 8,
    borderWidth: 1,
    borderColor: 'rgba(239, 68, 68, 0.2)',
    borderRadius: 6,
  },
  deleteBtnText: {
    color: '#ef4444',
    fontSize: 12,
    fontWeight: 'bold',
  },
  feedbackContainer: {
    backgroundColor: '#1e293b',
    padding: 15,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#334155',
  },
  logoutButton: {
    marginTop: 25,
    padding: 15,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(239, 68, 68, 0.2)',
    alignItems: 'center',
  },
  logoutButtonText: {
    color: '#ef4444',
    fontSize: 16,
    fontWeight: 'bold',
  }
});
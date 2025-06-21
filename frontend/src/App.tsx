import { Routes, Route } from 'react-router-dom';
import { useEffect } from 'react';
import './App.css';
import HomePage from './components/HomePage';
import LoginForm from './components/LoginForm';
import CreateUserForm from './components/CreateUserForm';
import { useAuth } from './contexts/AuthContext';
import { setAuthToken } from './api/notesApi';

function App() {
  const { state } = useAuth();

  // Set auth token when app initializes or auth state changes
  useEffect(() => {
    setAuthToken(state.token);
  }, [state.token]);

  return (
    <div className="app-container">
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/login" element={<LoginForm />} />
        <Route path="/create-user" element={<CreateUserForm />} />
      </Routes>
    </div>
  );
}

export default App;
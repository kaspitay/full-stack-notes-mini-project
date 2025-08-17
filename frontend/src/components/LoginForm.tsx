import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import * as authApi from '../api/authApi';
import { useNavigate } from 'react-router-dom';

const LoginForm = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const { state, dispatch } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!username || !password) {
      dispatch({ type: 'LOGIN_FAILURE', payload: 'Username and password are required' });
      return;
    }

    dispatch({ type: 'SET_LOADING', payload: true });

    try {
      const result = await authApi.loginUser({ username, password });
      dispatch({ type: 'LOGIN_SUCCESS', payload: result });
      navigate('/');
    } catch (error: any) {
      dispatch({ 
        type: 'LOGIN_FAILURE', 
        payload: error.response?.data?.message || 'Login failed' 
      });
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-form-wrapper">
        <h2>Login</h2>
        
        {state.error && (
          <div className="error-message">
            {state.error}
          </div>
        )}

        <form onSubmit={handleSubmit} data-testid="login_form">
          <div className="form-group">
            <label htmlFor="username">Username</label>
            <input
              type="text"
              id="username"
              data-testid="login_form_username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="password">Password</label>
            <input
              type="password"
              id="password"
              data-testid="login_form_password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          <button 
            type="submit" 
            data-testid="login_form_login"
            disabled={state.loading}
          >
            {state.loading ? 'Logging in...' : 'Login'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default LoginForm;

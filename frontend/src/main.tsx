import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import App from './App';
import './index.css';
import { NotesProvider } from './contexts/NotesContext';
import { AuthProvider } from './contexts/AuthContext';
import { SanitizerProvider } from './contexts/SanitizerContext';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <BrowserRouter>
      <AuthProvider>
        <SanitizerProvider>
          <NotesProvider>
            <App />
          </NotesProvider>
        </SanitizerProvider>
      </AuthProvider>
    </BrowserRouter>
  </React.StrictMode>,
);
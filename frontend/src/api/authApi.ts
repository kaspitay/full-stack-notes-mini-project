import axios from 'axios';
import { LoginResponse, User } from '../types';

const API_URL = 'http://localhost:3001/api';

// Configure axios with default headers
const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Login user
export const loginUser = async (credentials: { username: string; password: string }): Promise<LoginResponse> => {
  const response = await api.post('/login', credentials);
  return response.data;
};

// Create user
export const createUser = async (userData: {
  name: string;
  email: string;
  username: string;
  password: string;
}): Promise<User> => {
  const response = await api.post('/users', userData);
  return response.data;
};

import axios from 'axios';
import mongoose from 'mongoose';
import { createServer, Server } from 'http';
import createApp from '../expressApp';
import connectDB from '../config/db';
import Note from '../models/note';
import User from '../models/user';
import dotenv from 'dotenv';

dotenv.config();

let server: Server;
const app = createApp();
const TEST_PORT = 3004;
const API_URL = `http://localhost:${TEST_PORT}/api`;
const TEST_TAG = `test_${Date.now()}`;

let testUserToken: string;
let testUserId: string;

beforeAll(async () => {
  await connectDB();
  server = createServer(app).listen(TEST_PORT);
  
  await new Promise((resolve) => {
    server.on('listening', resolve);
  });
  
  // Create a test user and get token
  const testUser = {
    name: 'Test User',
    email: 'test@example.com',
    username: `testuser_${TEST_TAG}`,
    password: 'testpassword123'
  };
  
  const userResponse = await axios.post(`${API_URL}/users`, testUser);
  testUserId = userResponse.data.id;
  
  const loginResponse = await axios.post(`${API_URL}/login`, {
    username: testUser.username,
    password: testUser.password
  });
  
  testUserToken = loginResponse.data.token;
});

beforeEach(async () => {
  await Note.deleteMany({ title: { $regex: TEST_TAG } });
});

afterAll(async () => {
  await Note.deleteMany({ title: { $regex: TEST_TAG } });
  await User.deleteMany({ username: { $regex: TEST_TAG } });
  
  if (server) {
    await new Promise<void>((resolve) => {
      server.close(() => {
        resolve();
      });
    });
  }
  
  await mongoose.connection.close();
});

describe('Essential Authentication Tests', () => {
  // Test note creation with authentication
  test('Should create a new note with authentication', async () => {
    const noteData = {
      title: `${TEST_TAG} Test Note`,
      author: {
        name: 'Test Author',
        email: 'test@example.com'
      },
      content: 'This is a test note'
    };

    const response = await axios.post(`${API_URL}/notes`, noteData, {
      headers: {
        'Authorization': `Bearer ${testUserToken}`
      }
    });
    
    expect(response.status).toBe(201);
    expect(response.data.title).toBe(noteData.title);
    expect(response.data.user).toBe(testUserId);
  });

  // Test note creation without authentication (should fail)
  test('Should fail to create a note without authentication', async () => {
    const noteData = {
      title: `${TEST_TAG} Unauthorized Note`,
      author: {
        name: 'Test Author',
        email: 'test@example.com'
      },
      content: 'This should fail'
    };

    try {
      await axios.post(`${API_URL}/notes`, noteData);
      fail('Expected request to fail');
    } catch (error: any) {
      expect(error.response.status).toBe(401);
    }
  });

  // Test user creation
  test('Should create a new user', async () => {
    const userData = {
      name: 'New Test User',
      email: 'newtest@example.com',
      username: `newuser_${TEST_TAG}`,
      password: 'newpassword123'
    };

    const response = await axios.post(`${API_URL}/users`, userData);
    
    expect(response.status).toBe(201);
    expect(response.data.name).toBe(userData.name);
    expect(response.data.username).toBe(userData.username);
    expect(response.data.id).toBeDefined();
    expect(response.data.passwordHash).toBeUndefined();
  });

  // Test login with valid credentials
  test('Should login with valid credentials', async () => {
    const userData = {
      name: 'Login Test User',
      email: 'logintest@example.com',
      username: `loginuser_${TEST_TAG}`,
      password: 'loginpassword123'
    };

    await axios.post(`${API_URL}/users`, userData);

    const loginData = {
      username: userData.username,
      password: userData.password
    };

    const response = await axios.post(`${API_URL}/login`, loginData);
    
    expect(response.status).toBe(200);
    expect(response.data.token).toBeDefined();
    expect(response.data.user.name).toBe(userData.name);
  });

  // Test login with invalid credentials
  test('Should fail to login with invalid credentials', async () => {
    const loginData = {
      username: 'nonexistent',
      password: 'wrongpassword'
    };

    try {
      await axios.post(`${API_URL}/login`, loginData);
      fail('Expected login to fail');
    } catch (error: any) {
      expect(error.response.status).toBe(401);
    }
  });
});

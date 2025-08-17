import axios from 'axios';
import mongoose from 'mongoose';
import { createServer, Server } from 'http';
import createApp from '../expressApp';
import connectDB from '../config/db';
import dotenv from 'dotenv';

dotenv.config();

let server: Server;
const app = createApp();
const TEST_PORT = 3003;
const API_URL = `http://localhost:${TEST_PORT}/api`;

beforeAll(async () => {
  await connectDB();
  server = createServer(app).listen(TEST_PORT);
  
  await new Promise((resolve) => {
    server.on('listening', resolve);
  });
});

afterAll(async () => {
  if (server) {
    await new Promise<void>((resolve) => {
      server.close(() => {
        resolve();
      });
    });
  }
  
  await mongoose.connection.close();
});

describe('Essential Read Operations (No Authentication Required)', () => {
  // Test for reading notes without authentication
  test('Should get all notes without authentication', async () => {
    const response = await axios.get(`${API_URL}/notes`);
    
    expect(response.status).toBe(200);
    expect(Array.isArray(response.data)).toBe(true);
    expect(response.headers['x-total-count']).toBeDefined();
  });

  // Test pagination
  test('Should get notes with pagination', async () => {
    const response = await axios.get(`${API_URL}/notes?_page=1&_per_page=5`);
    
    expect(response.status).toBe(200);
    expect(Array.isArray(response.data)).toBe(true);
    expect(response.data.length).toBeLessThanOrEqual(5);
  });
});

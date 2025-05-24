import axios from 'axios';
import mongoose from 'mongoose';
import { createServer, Server } from 'http';
import createApp from '../expressApp';
import connectDB from '../config/db';
import Note from '../models/note';
import dotenv from 'dotenv';

dotenv.config();

let server: Server;
const app = createApp();
const TEST_PORT = 3002;
const API_URL = `http://localhost:${TEST_PORT}/api`;
const TEST_TAG = `test_${Date.now()}`; // Create a unique tag for this test run

beforeAll(async () => {
  await connectDB();
  server = createServer(app).listen(TEST_PORT);
});

beforeEach(async () => {
  // Instead of deleting all notes, only delete the ones created by this test run
  await Note.deleteMany({ title: { $regex: TEST_TAG } });
});

afterAll(async () => {
  // Clean up any remaining test notes
  await Note.deleteMany({ title: { $regex: TEST_TAG } });
  server.close();
  await mongoose.connection.close();
});

describe('Note CRUD Operations', () => {
  // Test for creating a note
  test('Should create a new note', async () => {
    const noteData = {
      title: `${TEST_TAG} Test Note`,
      author: {
        name: 'Test Author',
        email: 'test@example.com'
      },
      content: 'This is a test note'
    };

    const response = await axios.post(`${API_URL}/notes`, noteData);
    
    expect(response.status).toBe(201);
    expect(response.data.title).toBe(noteData.title);
    expect(response.data.content).toBe(noteData.content);
    expect(response.data.author.name).toBe(noteData.author.name);
    expect(response.data.author.email).toBe(noteData.author.email);
    expect(response.data._id).toBeDefined();
  });

  // Test for reading a note
  test('Should get a note by ID', async () => {
    // First create a note
    const noteData = {
      title: `${TEST_TAG} Test Note for Reading`,
      author: {
        name: 'Read Test',
        email: 'read@example.com'
      },
      content: 'This note should be readable'
    };

    const createResponse = await axios.post(`${API_URL}/notes`, noteData);
    const noteId = createResponse.data._id;

    // Now try to get it
    const response = await axios.get(`${API_URL}/notes/${noteId}`);
    
    expect(response.status).toBe(200);
    expect(response.data.title).toBe(noteData.title);
    expect(response.data.content).toBe(noteData.content);
    expect(response.data._id).toBe(noteId);
  });

  // Test for updating a note
  test('Should update a note by ID', async () => {
    // First create a note
    const noteData = {
      title: `${TEST_TAG} Original Title`,
      author: {
        name: 'Update Test',
        email: 'update@example.com'
      },
      content: 'Original content'
    };

    const createResponse = await axios.post(`${API_URL}/notes`, noteData);
    const noteId = createResponse.data._id;

    // Now update it
    const updateData = {
      title: `${TEST_TAG} Updated Title`,
      content: 'Updated content'
    };

    const response = await axios.put(`${API_URL}/notes/${noteId}`, updateData);
    
    expect(response.status).toBe(200);
    expect(response.data.title).toBe(updateData.title);
    expect(response.data.content).toBe(updateData.content);
    expect(response.data._id).toBe(noteId);
    // Author should remain unchanged
    expect(response.data.author.name).toBe(noteData.author.name);
  });

  // Test for deleting a note
  test('Should delete a note by ID', async () => {
    // First create a note
    const noteData = {
      title: `${TEST_TAG} Note to Delete`,
      author: {
        name: 'Delete Test',
        email: 'delete@example.com'
      },
      content: 'This note should be deleted'
    };

    const createResponse = await axios.post(`${API_URL}/notes`, noteData);
    const noteId = createResponse.data._id;

    // Now delete it
    const deleteResponse = await axios.delete(`${API_URL}/notes/${noteId}`);
    expect(deleteResponse.status).toBe(204);
  });
});
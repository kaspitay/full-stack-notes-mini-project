import { test, expect } from '@playwright/test';

// Test suite for CRUD operations in the notes app
test.describe('Notes CRUD operations', () => {
  // Set up the test environment before each test
  test.beforeEach(async ({ page }) => {
    await page.goto('http://localhost:3000');
    
    // Handle empty database
    await Promise.race([
      page.waitForSelector('.notes-list'),
      page.waitForSelector('.no-notes')
    ]);
    
    if (await page.locator('.no-notes').isVisible()) {
      await page.locator('button[name="add_new_note"]').click();
      await page.locator('input[name="text_input_new_note"]').fill('Test note');
      await page.locator('button[name="text_input_save_new_note"]').click();
      await page.waitForSelector('.notes-list');
    }
  });

  // Test for reading notes 
  test('should display notes', async ({ page }) => {
    const noteCount = await page.locator('.note').count();
    expect(noteCount).toBeGreaterThan(0);
  });

  // Test for creating a new note 
  test('should create a new note', async ({ page }) => {
    await page.locator('button[name="add_new_note"]').click();
    await page.locator('input[name="text_input_new_note"]').fill('New test note');
    await page.locator('button[name="text_input_save_new_note"]').click();
    
    await expect(page.locator('.note').first()).toContainText('New test note');
  });

  // Test for updating a note 
  test('should update a note', async ({ page }) => {
    const noteId = await page.locator('.note').first().getAttribute('data-testid');
    await page.locator(`button[data-testid="edit-${noteId}"]`).click();
    await page.locator(`textarea[data-testid="text_input-${noteId}"]`).fill('Updated note');
    await page.locator(`button[data-testid="text_input_save-${noteId}"]`).click();
    
    await expect(page.locator('.note').first()).toContainText('Updated note');
  });

  // Test for deleting a note 
  test('should delete a note', async ({ page }) => {
    const noteId = await page.locator('.note').first().getAttribute('data-testid');
    const noteText = await page.locator('.note').first().textContent();
    
    // Fixed: Using name attribute instead of data-testid for delete button
    await page.locator(`button[name="delete-${noteId}"]`).click();
    
    // Wait for notification
    await page.waitForSelector('.notification:has-text("deleted")');
    
    // Check that the content of the deleted note is no longer on the page
    const pageContent = await page.textContent('body');
    expect(pageContent).not.toContain(noteText);
  });

  // Clean up test data after all tests
  test.afterAll(async ({ request }) => {
    try {
      // Get the test notes created during the test
      const response = await request.get('http://localhost:3001/api/notes?_page=1&_per_page=5');
      const notes = await response.json();
      
      // Delete only the test notes (those with titles containing "test" or "Test")
      for (const note of notes) {
        if (note.title.toLowerCase().includes('test') || 
            (note.content && note.content.toLowerCase().includes('test'))) {
          await request.delete(`http://localhost:3001/api/notes/${note._id}`);
        }
      }
    } catch (error) {
      console.error('Failed to clean up test data:', error);
    }
  });
});
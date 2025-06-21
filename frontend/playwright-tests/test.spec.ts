import { test, expect } from '@playwright/test';

test.describe('Complete Notes App Testing', () => {
  let testUser: {
    name: string;
    email: string;
    username: string;
    password: string;
  };

  test.beforeEach(async ({ page }) => {
    testUser = {
      name: 'Test User',
      email: `test${Date.now()}@example.com`,
      username: `testuser${Date.now()}`,
      password: 'testpassword123'
    };

    await page.goto('http://localhost:3000');
  });

  // Authentication Tests (Required by Assignment)
  test('should create user, login, and access protected features', async ({ page }) => {
    // Create user
    await page.click('[data-testid="go_to_create_user_button"]');
    await page.fill('[data-testid="create_user_form_name"]', testUser.name);
    await page.fill('[data-testid="create_user_form_email"]', testUser.email);
    await page.fill('[data-testid="create_user_form_username"]', testUser.username);
    await page.fill('[data-testid="create_user_form_password"]', testUser.password);
    await page.click('[data-testid="create_user_form_create_user"]');
    
    await page.waitForURL('http://localhost:3000');
    
    // Login
    await page.click('[data-testid="go_to_login_button"]');
    await page.fill('[data-testid="login_form_username"]', testUser.username);
    await page.fill('[data-testid="login_form_password"]', testUser.password);
    await page.click('[data-testid="login_form_login"]');
    
    await page.waitForURL('http://localhost:3000');
    await page.waitForSelector('[data-testid="logout"]');
    
    // Should see add note button (only visible when logged in)
    await expect(page.locator('button[name="add_new_note"]')).toBeVisible();
  });

  // Guest Access Test (Required by Assignment)
  test('should view notes without logging in but cannot modify', async ({ page }) => {
    // Should see login/register buttons
    await expect(page.locator('[data-testid="go_to_login_button"]')).toBeVisible();
    await expect(page.locator('[data-testid="go_to_create_user_button"]')).toBeVisible();
    
    // Should not see add note button
    await expect(page.locator('button[name="add_new_note"]')).not.toBeVisible();
    
    // Should be able to view existing notes (if any)
    const notesContainer = page.locator('.notes-container, .notes-list, [data-testid="notes-list"]');
    await expect(notesContainer).toBeVisible();
    
    // Verify that edit/delete buttons are not visible for guests
    const editButtons = page.locator('button[name*="edit"], button[data-testid*="edit"]');
    const deleteButtons = page.locator('button[name*="delete"], button[data-testid*="delete"]');
    
    // These should either not exist or not be visible to guests
    const editCount = await editButtons.count();
    const deleteCount = await deleteButtons.count();
    
    if (editCount > 0) {
      await expect(editButtons.first()).not.toBeVisible();
    }
    if (deleteCount > 0) {
      await expect(deleteButtons.first()).not.toBeVisible();
    }
  });

  // Comprehensive CRUD Test (Your Original Strength)
  test('should perform complete CRUD operations when logged in', async ({ page }) => {
    // Setup: Login first
    await page.click('[data-testid="go_to_create_user_button"]');
    await page.fill('[data-testid="create_user_form_name"]', testUser.name);
    await page.fill('[data-testid="create_user_form_email"]', testUser.email);
    await page.fill('[data-testid="create_user_form_username"]', testUser.username);
    await page.fill('[data-testid="create_user_form_password"]', testUser.password);
    await page.click('[data-testid="create_user_form_create_user"]');
    await page.waitForURL('http://localhost:3000');
    
    await page.click('[data-testid="go_to_login_button"]');
    await page.fill('[data-testid="login_form_username"]', testUser.username);
    await page.fill('[data-testid="login_form_password"]', testUser.password);
    await page.click('[data-testid="login_form_login"]');
    await page.waitForURL('http://localhost:3000');
    await page.waitForSelector('[data-testid="logout"]');

    // CREATE: Add a new note
    await page.click('button[name="add_new_note"]');
    const uniqueNoteContent = `CRUD Test Note ${Date.now()}`;
    await page.fill('input[name="text_input_new_note"]', uniqueNoteContent);
    await page.click('button[name="text_input_save_new_note"]');
    
    // READ: Verify note appears
    await expect(page.locator(`text=${uniqueNoteContent}`)).toBeVisible();
    
    // Get the note element that was just created
    const noteElement = page.locator('.note').filter({ hasText: uniqueNoteContent });
    
    // Verify the note has edit and delete buttons (only visible to logged-in users who own the note)
    await expect(noteElement.locator('button[name*="edit"], button[data-testid*="edit"]')).toBeVisible();
    await expect(noteElement.locator('button[name*="delete"], button[data-testid*="delete"]')).toBeVisible();
    
    // UPDATE: Edit the note
    const editButton = noteElement.locator('button[name*="edit"], button[data-testid*="edit"]').first();
    await editButton.click();
    
    // Fill in the updated content (try multiple possible selectors for the edit input)
    const updatedContent = `Updated ${uniqueNoteContent}`;
    const editInput = page.locator('input[name*="text_input"], textarea[name*="text_input"], input[data-testid*="text_input"], textarea[data-testid*="text_input"]').first();
    await editInput.fill(updatedContent);
    
    // Save the changes
    const saveButton = page.locator('button[name*="save"], button[data-testid*="save"]').first();
    await saveButton.click();
    
    // Verify the note was updated
    await expect(page.locator(`text=${updatedContent}`)).toBeVisible();
    
    // DELETE: Remove the note
    const updatedNoteElement = page.locator('.note').filter({ hasText: updatedContent });
    const deleteButton = updatedNoteElement.locator('button[name*="delete"], button[data-testid*="delete"]').first();
    await deleteButton.click();
    
    // Verify the note was deleted (content should not be visible anymore)
    await expect(page.locator(`text=${updatedContent}`)).not.toBeVisible();
    await expect(page.locator(`text=${uniqueNoteContent}`)).not.toBeVisible();
  });

  // Logout Test
  test('should logout successfully', async ({ page }) => {
    // Quick login
    await page.click('[data-testid="go_to_create_user_button"]');
    await page.fill('[data-testid="create_user_form_name"]', testUser.name);
    await page.fill('[data-testid="create_user_form_email"]', testUser.email);
    await page.fill('[data-testid="create_user_form_username"]', testUser.username);
    await page.fill('[data-testid="create_user_form_password"]', testUser.password);
    await page.click('[data-testid="create_user_form_create_user"]');
    await page.waitForURL('http://localhost:3000');
    
    await page.click('[data-testid="go_to_login_button"]');
    await page.fill('[data-testid="login_form_username"]', testUser.username);
    await page.fill('[data-testid="login_form_password"]', testUser.password);
    await page.click('[data-testid="login_form_login"]');
    await page.waitForURL('http://localhost:3000');
    await page.waitForSelector('[data-testid="logout"]');

    // Logout
    await page.click('[data-testid="logout"]');
    
    // Verify logged out state
    await expect(page.locator('[data-testid="go_to_login_button"]')).toBeVisible();
    await expect(page.locator('button[name="add_new_note"]')).not.toBeVisible();
  });

  // Error Handling Test
  test('should handle invalid login credentials', async ({ page }) => {
    await page.click('[data-testid="go_to_login_button"]');
    await page.fill('[data-testid="login_form_username"]', 'nonexistent');
    await page.fill('[data-testid="login_form_password"]', 'wrongpassword');
    await page.click('[data-testid="login_form_login"]');
    
    // Should stay on login page
    await expect(page.url()).toContain('/login');
  });
});

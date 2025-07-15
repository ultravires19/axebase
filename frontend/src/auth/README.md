# Authentication Module

A reusable, modular authentication system integrated with a Rust/Axum backend. This module provides a clean interface for authentication operations while delegating security-critical operations to the backend.

## Design Goals

- **Reusable**: Works across multiple projects with minimal changes
- **Portable**: All backend interactions abstracted behind clean interfaces
- **Modular**: Everything auth-related lives in `/src/auth/` - no scattered code
- **Security**: Password hashing and JWT operations handled by the backend
- **Data Ownership**: User profiles stored in our own PostgreSQL database

## Directory Structure

```
/src/auth/
├── components/    # UI components for authentication
├── services/      # Backend service abstractions
│   ├── AuthAPI.ts # Implementation for Rust/Axum backend
│   └── index.ts   # Service interfaces
├── stores/        # State management
│   └── AuthProvider.tsx # SolidJS auth context provider
├── types/         # TypeScript interfaces
├── utils/         # Validation, token helpers
└── index.ts       # Main barrel export
```

## Core Interfaces

The module is built around these key interfaces:

- **User**: Application-specific user profile data
- **AuthUser**: Essential authentication information (id, email, verification status)
- **AuthService**: Interface for authentication operations (register, login, logout)
- **UserService**: Interface for user profile management

## Backend Integration

This auth module communicates with a Rust/Axum backend that handles:

- Password hashing with bcrypt
- JWT token generation and validation
- User data storage in PostgreSQL
- Session management

## Usage

```typescript
import { initAuth } from 'path/to/auth';

// Initialize auth module
initAuth({
  apiUrl: 'https://your-api.com',
  tokenStorage: 'localStorage',
  redirects: {
    afterLogin: '/dashboard',
    unauthorized: '/login'
  }
});

// Later in your app
import { useAuth } from 'path/to/auth';

function MyComponent() {
  const { user, login, logout } = useAuth();
  
  // Use auth functionality
}
```

## Implementation Notes

This module uses clean interfaces for all external interactions, allowing for different concrete implementations while maintaining the same API. The default implementation uses SolidJS for reactivity, but the core interfaces are framework-agnostic.

### Security Considerations

- Passwords are never stored or hashed in the frontend
- Authentication tokens are stored in localStorage (consider HttpOnly cookies for production)
- JWT validation is performed on the backend
- Frontend only decodes JWT payloads for display and state management

### API Endpoints

The module communicates with these backend endpoints:

- `POST /auth/register` - Register a new user
- `POST /auth/login` - Login with credentials
- `GET /auth/verify-email/{token}` - Verify email (placeholder)
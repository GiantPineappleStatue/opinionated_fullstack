# Fullstack Boilerplate with Role-Based Authentication

This project is a fullstack boilerplate with a robust role-based authentication system. It includes a NestJS backend and a React frontend.

## Features

- **User Authentication**: Complete authentication system with registration, login, and logout
- **Role-Based Access Control**: Support for different user roles (User and Admin)
- **Session Management**: Secure session management with Redis
- **Admin Panel**: Administrative functionality for user management
- **UUIDv7**: Modern UUID implementation for secure user identification

## Getting Started

### Prerequisites

- Node.js (v18+)
- MySQL/MariaDB
- Redis (optional, for production)

### Installation

1. Clone the repository:

```bash
git clone https://github.com/yourusername/fullstack-boilerplate.git
cd fullstack-boilerplate
```

2. Install dependencies:

```bash
npm install
```

3. Set up environment variables:

```bash
cp .env.example .env
# Edit .env with your database credentials
```

4. Start the development server:

```bash
npm run dev
```

### Creating an Admin User

To create an admin user:

```bash
cd apps/backend
npm run create-admin
```

This will create an admin user with the following default credentials (unless overridden by environment variables):
- Email: admin@example.com
- Password: admin123
- Name: Admin User

## Architecture

### Backend (NestJS)

- **Authentication Module**: Handles user registration, login, and session management
- **Admin Module**: Provides administrative functionality (user management)
- **Guards**: Implements authentication and role-based access control
- **Database**: MySQL/MariaDB with migrations

### Frontend (React)

- **Authentication Context**: Manages user authentication state
- **Protected Routes**: Routes that require authentication
- **Role-Based Components**: Components that are only rendered for specific user roles

## Security Features

- **Password Hashing**: Passwords are hashed using bcrypt
- **Session Management**: Secure session management with Redis
- **Role-Based Access Control**: Fine-grained access control based on user roles
- **UUIDv7**: Modern UUID implementation for secure user identification

## Documentation

- [Authentication System](apps/backend/src/auth/README.md)
- [Admin Module](apps/backend/src/admin/README.md)

## License

This project is licensed under the MIT License - see the LICENSE file for details.
# opinionated_fullstack

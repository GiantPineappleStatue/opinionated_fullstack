# Authentication System with Role-Based Access Control

This module provides a complete authentication system with role-based access control (RBAC) for the NestJS backend.

## Features

- User registration and login
- Session-based authentication
- Role-based access control (User and Admin roles)
- Public routes that don't require authentication
- Admin-only routes and functionality
- UUIDv7 for user IDs

## Authentication Flow

1. Users register with email, password, and name
2. Users login with email and password
3. Session is created and stored in Redis (or memory in development)
4. Protected routes check for valid session
5. Role-based routes check for appropriate user role

## Usage

### Public Routes

Use the `@Public()` decorator to mark routes that don't require authentication:

```typescript
import { Public } from '../common/decorators/public.decorator';

@Public()
@Post('login')
async login() {
  // This endpoint is accessible without authentication
}
```

### Role-Based Routes

Use the `@Roles()` decorator to restrict routes to specific user roles:

```typescript
import { Roles, UserRole } from '../common/guards/roles.guard';

@Roles(UserRole.ADMIN)
@Get('admin-only')
async adminOnly() {
  // This endpoint is only accessible to admin users
}
```

## Admin Management

The system includes an admin module that provides:

1. Ability to view all users (admin only)
2. Ability to promote users to admin role (admin only)

## Creating an Admin User

To create an admin user, run:

```bash
npm run create-admin
```

This will create an admin user with the following default credentials (unless overridden by environment variables):

- Email: admin@example.com
- Password: admin123
- Name: Admin User

You can customize these values by setting the following environment variables:
- `ADMIN_EMAIL`
- `ADMIN_PASSWORD`
- `ADMIN_NAME`

## Database Schema

The users table includes a role column that stores the user's role:

```sql
CREATE TABLE IF NOT EXISTS users (
  id CHAR(36) PRIMARY KEY,
  email VARCHAR(255) NOT NULL UNIQUE,
  password VARCHAR(255) NOT NULL,
  name VARCHAR(255) NOT NULL,
  role ENUM('user', 'admin') NOT NULL DEFAULT 'user',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);
```

## Security Considerations

- Passwords are hashed using bcrypt
- Sessions are stored securely in Redis (in production)
- Role checks are performed at the controller level
- UUIDv7 is used for user IDs to prevent enumeration attacks 
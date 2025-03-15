# Admin Module

This module provides administrative functionality for the application, restricted to users with the Admin role.

## Features

- View all users in the system
- Promote regular users to admin role
- Role-based access control using the `@Roles(UserRole.ADMIN)` decorator

## API Endpoints

### GET /admin/users

Retrieves a list of all users in the system.

**Response:**
```json
[
  {
    "id": "01h9xz7a3z1234567890abcdef",
    "email": "user@example.com",
    "name": "Regular User",
    "role": "user",
    "createdAt": "2023-01-01T00:00:00.000Z",
    "updatedAt": "2023-01-01T00:00:00.000Z"
  },
  {
    "id": "01h9xz7a3z1234567890abcdeg",
    "email": "admin@example.com",
    "name": "Admin User",
    "role": "admin",
    "createdAt": "2023-01-01T00:00:00.000Z",
    "updatedAt": "2023-01-01T00:00:00.000Z"
  }
]
```

### POST /admin/users/:userId/promote

Promotes a user to admin role.

**Parameters:**
- `userId`: The UUID of the user to promote

**Response:**
```json
{
  "id": "01h9xz7a3z1234567890abcdef",
  "email": "user@example.com",
  "name": "Regular User",
  "role": "admin",
  "createdAt": "2023-01-01T00:00:00.000Z",
  "updatedAt": "2023-01-01T00:00:00.000Z"
}
```

## Security

- All endpoints in this module are restricted to users with the Admin role
- Role checks are performed by the `RolesGuard`
- Authentication is required for all endpoints
- UUIDv7 is used for user IDs to prevent enumeration attacks

## Usage in Code

```typescript
// Inject the AdminService
constructor(private readonly adminService: AdminService) {}

// Get all users
const users = await this.adminService.getAllUsers();

// Promote a user to admin
const updatedUser = await this.adminService.promoteUserToAdmin(userId, adminId);
``` 
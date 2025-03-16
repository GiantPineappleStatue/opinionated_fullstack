# Auth Service Types Analysis

## From api.schema.ts:
- `ApiResponseDto<T>` is a generic wrapper that contains:
  - `data: T`
  - `message?: string`
  - `status: number`

## From auth.schema.ts:
- `AuthResponseDto` is a flat object with:
  - `id: string`
  - `email: string`
  - `name: string`
  - `role: UserRole`
  - `emailVerified?: boolean`

## Current Issue:
The auth service is trying to access `response.data.data` but the response structure should be:
```typescript
// What we get from API:
{
  data: AuthResponseDto,  // from ApiResponseDto<AuthResponseDto>
  message?: string,
  status: number
}

// What we're trying to access:
response.data.data  // This is wrong because AuthResponseDto is already the data
```

## Solution:
1. In auth-service.ts, we should access just `response.data` since that's the ApiResponseDto wrapper
2. For functions returning user data, we should return the AuthResponseDto directly
3. For functions returning other data (like verification status), we should use the specific response types 
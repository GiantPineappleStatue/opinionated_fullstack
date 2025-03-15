import { createFileRoute } from '@tanstack/react-router';
import { UserList } from '../features/user/components/user-list';

export const Route = createFileRoute('/_auth/users')({
  component: UsersPage,
});

function UsersPage() {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">User Management</h1>
        <p className="text-muted-foreground">
          View and manage users in the system
        </p>
      </div>
      <UserList />
    </div>
  );
} 
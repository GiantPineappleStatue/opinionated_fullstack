import { useState } from 'react';
import { useUsersList } from '../hooks/use-users-list';
import { Button } from '../../../components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '../../../components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../../../components/ui/table';
import { Badge } from '../../../components/ui/badge';
import { AlertCircle, CheckCircle, UserPlus, ExternalLink } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '../../../components/ui/alert';
import { Skeleton } from '../../../components/ui/skeleton';
import { Link } from '@tanstack/react-router';

export function UserList() {
  const { users, isLoading, isError, promoteUser, isPromoteUserPending } = useUsersList();
  const [promotingUserId, setPromotingUserId] = useState<string | null>(null);

  const handlePromoteUser = async (userId: string) => {
    setPromotingUserId(userId);
    try {
      await promoteUser(userId);
    } finally {
      setPromotingUserId(null);
    }
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <Skeleton className="h-8 w-1/3" />
          <Skeleton className="h-4 w-2/3" />
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {Array.from({ length: 5 }).map((_, i) => (
              <Skeleton key={i} className="h-12 w-full" />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (isError) {
    return (
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>Error</AlertTitle>
        <AlertDescription>
          Failed to load users. Please try again later.
        </AlertDescription>
      </Alert>
    );
  }

  if (!users || users.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Users</CardTitle>
          <CardDescription>No users found.</CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Users</CardTitle>
        <CardDescription>Manage users and their roles.</CardDescription>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Role</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {users.map((user) => (
              <TableRow key={user.id}>
                <TableCell>{user.name || 'N/A'}</TableCell>
                <TableCell>{user.email}</TableCell>
                <TableCell>
                  <Badge variant={user.role === 'admin' ? 'default' : 'outline'}>
                    {user.role}
                  </Badge>
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="ghost"
                      size="icon"
                      asChild
                    >
                      <Link to="/users/$userId" params={{ userId: user.id }} title="View user details">
                        <ExternalLink className="h-4 w-4" />
                      </Link>
                    </Button>
                    {user.role !== 'admin' && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handlePromoteUser(user.id)}
                        disabled={isPromoteUserPending || promotingUserId === user.id}
                      >
                        {promotingUserId === user.id ? (
                          <>
                            <Skeleton className="h-4 w-4 mr-2" />
                            Promoting...
                          </>
                        ) : (
                          <>
                            <UserPlus className="h-4 w-4 mr-2" />
                            Promote to Admin
                          </>
                        )}
                      </Button>
                    )}
                    {user.role === 'admin' && (
                      <Badge variant="secondary">
                        <CheckCircle className="h-3 w-3 mr-1" />
                        Admin
                      </Badge>
                    )}
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
      <CardFooter className="flex justify-between">
        <div className="text-sm text-muted-foreground">
          Total users: {users.length}
        </div>
      </CardFooter>
    </Card>
  );
} 
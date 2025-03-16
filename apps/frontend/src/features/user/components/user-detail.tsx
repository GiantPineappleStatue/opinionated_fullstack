import { useState, useEffect } from 'react';
import { useUser } from '../hooks/use-user';
import { Button } from '../../../components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '../../../components/ui/card';
import { Input } from '../../../components/ui/input';
import { Label } from '../../../components/ui/label';
import { Badge } from '../../../components/ui/badge';
import { AlertCircle, Save, User as UserIcon } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '../../../components/ui/alert';
import { Skeleton } from '../../../components/ui/skeleton';
import { Separator } from '../../../components/ui/separator';
import { Switch } from '../../../components/ui/switch';
import { AuthUser } from '../api/user-queries';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/lib/api/api-client';
import { useToast } from '@/hooks/use-toast';

interface UserDetailProps {
  userId: string;
}

export function UserDetail({ userId }: UserDetailProps) {
  const { data: user, isLoading, error } = useUser(userId);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState<Partial<AuthUser>>({});
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const updateUserMutation = useMutation({
    mutationFn: async (data: Partial<AuthUser>) => {
      const response = await apiClient.users.update(userId, data);
      if ('error' in response && response.error) {
        throw new Error(response.error.message);
      }
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users', 'detail', userId] });
      toast.success({
        message: 'Success',
        description: 'User details updated successfully',
      });
      setIsEditing(false);
    },
    onError: (error) => {
      toast.error({
        message: 'Error',
        description: error instanceof Error ? error.message : 'Failed to update user details',
      });
    },
  });

  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name,
        email: user.email,
      });
    }
  }, [user]);

  const handleSave = () => {
    if (Object.keys(formData).length > 0) {
      updateUserMutation.mutate(formData);
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-8 w-32" />
        <Skeleton className="h-24 w-full" />
      </div>
    );
  }

  if (error) {
    return (
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>Error</AlertTitle>
        <AlertDescription>
          {error instanceof Error ? error.message : 'Failed to load user details'}
        </AlertDescription>
      </Alert>
    );
  }

  if (!user) {
    return (
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>Error</AlertTitle>
        <AlertDescription>User not found</AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>User Information</CardTitle>
          <CardDescription>View and manage user details</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <Label>Email</Label>
                {isEditing ? (
                  <Input
                    value={formData.email || ''}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  />
                ) : (
                  <div className="text-sm">{user.email}</div>
                )}
              </div>
              <Badge variant={user.emailVerified ? 'default' : 'destructive'}>
                {user.emailVerified ? 'Verified' : 'Not Verified'}
              </Badge>
            </div>

            <div className="space-y-1">
              <Label>Name</Label>
              {isEditing ? (
                <Input
                  value={formData.name || ''}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                />
              ) : (
                <div className="text-sm">{user.name || 'Not set'}</div>
              )}
            </div>

            <div className="space-y-1">
              <Label>Role</Label>
              <div className="text-sm">{user.role}</div>
            </div>

            <div className="space-y-1">
              <Label>Created At</Label>
              <div className="text-sm">{new Date(user.createdAt).toLocaleString()}</div>
            </div>

            <div className="space-y-1">
              <Label>Last Updated</Label>
              <div className="text-sm">{new Date(user.updatedAt).toLocaleString()}</div>
            </div>
          </div>
        </CardContent>
        <CardFooter>
          {isEditing ? (
            <div className="flex gap-2">
              <Button onClick={() => setIsEditing(false)}>Cancel</Button>
              <Button 
                variant="default" 
                onClick={handleSave}
                disabled={updateUserMutation.isPending}
              >
                {updateUserMutation.isPending ? (
                  <div className="flex items-center gap-2">
                    <Skeleton className="h-4 w-4" />
                    Saving...
                  </div>
                ) : (
                  'Save Changes'
                )}
              </Button>
            </div>
          ) : (
            <Button onClick={() => setIsEditing(true)}>Edit Profile</Button>
          )}
        </CardFooter>
      </Card>
    </div>
  );
} 
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
import { User, UserPreferences } from '../api/user-queries';

interface UserDetailProps {
  userId: string;
}

export function UserDetail({ userId }: UserDetailProps) {
  const { 
    user, 
    preferences, 
    isLoading, 
    isError, 
    updateUser, 
    updatePreferences,
    isUpdateUserPending,
    isUpdatePreferencesPending
  } = useUser(userId);

  const [userForm, setUserForm] = useState<Partial<User>>({});
  const [preferencesForm, setPreferencesForm] = useState<Partial<UserPreferences>>({});
  const [isEditing, setIsEditing] = useState(false);

  // Initialize form when data is loaded
  useEffect(() => {
    if (user) {
      setUserForm({
        name: user.name,
        email: user.email,
      });
    }
    if (preferences) {
      setPreferencesForm({
        theme: preferences.theme,
        notifications: preferences.notifications,
      });
    }
  }, [user, preferences]);

  const handleUserChange = (field: keyof User, value: string) => {
    setUserForm(prev => ({ ...prev, [field]: value }));
  };

  const handlePreferencesChange = (field: keyof UserPreferences, value: string | boolean) => {
    setPreferencesForm(prev => ({ ...prev, [field]: value }));
  };

  const handleSave = async () => {
    if (Object.keys(userForm).length > 0) {
      updateUser(userForm);
    }
    if (Object.keys(preferencesForm).length > 0) {
      updatePreferences(preferencesForm);
    }
    setIsEditing(false);
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <Skeleton className="h-8 w-1/3" />
          <Skeleton className="h-4 w-2/3" />
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <Skeleton className="h-12 w-full" />
            <Skeleton className="h-12 w-full" />
            <Skeleton className="h-12 w-full" />
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
          Failed to load user details. Please try again later.
        </AlertDescription>
      </Alert>
    );
  }

  if (!user) {
    return (
      <Alert>
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>User not found</AlertTitle>
        <AlertDescription>
          The requested user could not be found.
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <UserIcon className="h-5 w-5" />
            <CardTitle>User Details</CardTitle>
          </div>
          <Badge variant={user.role === 'admin' ? 'default' : 'outline'}>
            {user.role}
          </Badge>
        </div>
        <CardDescription>View and manage user information</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          <div className="space-y-4">
            <div className="grid gap-4">
              <div className="grid gap-2">
                <Label htmlFor="name">Name</Label>
                {isEditing ? (
                  <Input
                    id="name"
                    value={userForm.name || ''}
                    onChange={(e) => handleUserChange('name', e.target.value)}
                  />
                ) : (
                  <div className="rounded-md border p-2">{user.name || 'N/A'}</div>
                )}
              </div>
              <div className="grid gap-2">
                <Label htmlFor="email">Email</Label>
                {isEditing ? (
                  <Input
                    id="email"
                    value={userForm.email || ''}
                    onChange={(e) => handleUserChange('email', e.target.value)}
                  />
                ) : (
                  <div className="rounded-md border p-2">{user.email}</div>
                )}
              </div>
            </div>
          </div>

          {preferences && (
            <>
              <Separator />
              <div className="space-y-4">
                <h3 className="text-lg font-medium">Preferences</h3>
                <div className="grid gap-4">
                  <div className="grid gap-2">
                    <Label htmlFor="theme">Theme</Label>
                    {isEditing ? (
                      <select
                        id="theme"
                        className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                        value={preferencesForm.theme || preferences.theme}
                        onChange={(e) => handlePreferencesChange('theme', e.target.value)}
                      >
                        <option value="light">Light</option>
                        <option value="dark">Dark</option>
                        <option value="system">System</option>
                      </select>
                    ) : (
                      <div className="rounded-md border p-2 capitalize">{preferences.theme}</div>
                    )}
                  </div>
                  <div className="flex items-center justify-between">
                    <Label htmlFor="notifications">Notifications</Label>
                    {isEditing ? (
                      <Switch
                        id="notifications"
                        checked={preferencesForm.notifications ?? preferences.notifications}
                        onCheckedChange={(checked) => handlePreferencesChange('notifications', checked)}
                      />
                    ) : (
                      <Badge variant={preferences.notifications ? 'default' : 'outline'}>
                        {preferences.notifications ? 'Enabled' : 'Disabled'}
                      </Badge>
                    )}
                  </div>
                </div>
              </div>
            </>
          )}
        </div>
      </CardContent>
      <CardFooter className="flex justify-between">
        <div className="text-sm text-muted-foreground">
          Last updated: {new Date(user.updatedAt).toLocaleDateString()}
        </div>
        <div className="flex space-x-2">
          {isEditing ? (
            <Button 
              onClick={handleSave}
              disabled={isUpdateUserPending || isUpdatePreferencesPending}
            >
              {(isUpdateUserPending || isUpdatePreferencesPending) ? (
                <>
                  <Skeleton className="h-4 w-4 mr-2" />
                  Saving...
                </>
              ) : (
                <>
                  <Save className="h-4 w-4 mr-2" />
                  Save
                </>
              )}
            </Button>
          ) : (
            <Button variant="outline" onClick={() => setIsEditing(true)}>
              Edit
            </Button>
          )}
        </div>
      </CardFooter>
    </Card>
  );
} 
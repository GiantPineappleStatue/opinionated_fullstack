import { useState, useEffect } from 'react';
import { useUser } from '../hooks/use-user';
import { Button } from '../../../components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '../../../components/ui/card';
import { Label } from '../../../components/ui/label';
import { Switch } from '../../../components/ui/switch';
import { AlertCircle, Save, Settings } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '../../../components/ui/alert';
import { Skeleton } from '../../../components/ui/skeleton';
import { UserPreferences } from '../api/user-queries';
import { RadioGroup, RadioGroupItem } from '../../../components/ui/radio-group';

interface UserPreferencesFormProps {
  userId: string;
}

export function UserPreferencesForm({ userId }: UserPreferencesFormProps) {
  const { 
    preferences, 
    isLoading, 
    isError, 
    updatePreferences,
    isUpdatePreferencesPending
  } = useUser(userId);

  const [form, setForm] = useState<Partial<UserPreferences>>({});
  const [isDirty, setIsDirty] = useState(false);

  // Initialize form when data is loaded
  useEffect(() => {
    if (preferences) {
      setForm({
        theme: preferences.theme,
        notifications: preferences.notifications,
      });
    }
  }, [preferences]);

  const handleChange = (field: keyof UserPreferences, value: string | boolean) => {
    setForm(prev => ({ ...prev, [field]: value }));
    setIsDirty(true);
  };

  const handleSave = async () => {
    if (Object.keys(form).length > 0) {
      updatePreferences(form);
      setIsDirty(false);
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
          <div className="space-y-4">
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
          Failed to load user preferences. Please try again later.
        </AlertDescription>
      </Alert>
    );
  }

  if (!preferences) {
    return (
      <Alert>
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>Preferences not found</AlertTitle>
        <AlertDescription>
          User preferences could not be found.
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center space-x-2">
          <Settings className="h-5 w-5" />
          <CardTitle>User Preferences</CardTitle>
        </div>
        <CardDescription>Customize your application experience</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          <div className="space-y-4">
            <div>
              <Label className="text-base">Theme</Label>
              <p className="text-sm text-muted-foreground">
                Select your preferred theme for the application.
              </p>
              <RadioGroup
                defaultValue={preferences.theme}
                value={form.theme || preferences.theme}
                onValueChange={(value) => handleChange('theme', value)}
                className="grid grid-cols-3 gap-4 pt-2"
              >
                <div>
                  <RadioGroupItem
                    value="light"
                    id="theme-light"
                    className="peer sr-only"
                  />
                  <Label
                    htmlFor="theme-light"
                    className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary"
                  >
                    <span className="mb-2">☀️</span>
                    Light
                  </Label>
                </div>
                <div>
                  <RadioGroupItem
                    value="dark"
                    id="theme-dark"
                    className="peer sr-only"
                  />
                  <Label
                    htmlFor="theme-dark"
                    className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary"
                  >
                    <span className="mb-2">🌙</span>
                    Dark
                  </Label>
                </div>
                <div>
                  <RadioGroupItem
                    value="system"
                    id="theme-system"
                    className="peer sr-only"
                  />
                  <Label
                    htmlFor="theme-system"
                    className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary"
                  >
                    <span className="mb-2">💻</span>
                    System
                  </Label>
                </div>
              </RadioGroup>
            </div>

            <div className="flex flex-row items-center justify-between rounded-lg border p-4">
              <div className="space-y-0.5">
                <Label className="text-base">Notifications</Label>
                <p className="text-sm text-muted-foreground">
                  Receive email notifications about account activity.
                </p>
              </div>
              <Switch
                checked={form.notifications ?? preferences.notifications}
                onCheckedChange={(checked) => handleChange('notifications', checked)}
              />
            </div>
          </div>
        </div>
      </CardContent>
      <CardFooter>
        <Button 
          onClick={handleSave}
          disabled={!isDirty || isUpdatePreferencesPending}
          className="ml-auto"
        >
          {isUpdatePreferencesPending ? (
            <>
              <Skeleton className="h-4 w-4 mr-2" />
              Saving...
            </>
          ) : (
            <>
              <Save className="h-4 w-4 mr-2" />
              Save Preferences
            </>
          )}
        </Button>
      </CardFooter>
    </Card>
  );
} 
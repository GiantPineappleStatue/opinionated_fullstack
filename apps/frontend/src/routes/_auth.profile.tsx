import { createFileRoute } from '@tanstack/react-router';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { ProfileView } from '../features/profile/components/profile-view';
import { ProfileForm } from '../features/profile/components/profile-form';

export const Route = createFileRoute('/_auth/profile')({
  component: ProfilePage,
});

function ProfilePage() {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Profile</h1>
        <p className="text-muted-foreground">
          Manage your profile and how others see you
        </p>
      </div>

      <Tabs defaultValue="view" className="w-full">
        <TabsList className="mb-4">
          <TabsTrigger value="view">View Profile</TabsTrigger>
          <TabsTrigger value="edit">Edit Profile</TabsTrigger>
        </TabsList>
        <TabsContent value="view">
          <ProfileView />
        </TabsContent>
        <TabsContent value="edit">
          <ProfileForm />
        </TabsContent>
      </Tabs>
    </div>
  );
} 
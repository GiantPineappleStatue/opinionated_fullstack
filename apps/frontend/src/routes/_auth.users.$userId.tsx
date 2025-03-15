import { createFileRoute, Link } from '@tanstack/react-router';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { UserDetail } from '../features/user/components/user-detail';
import { UserPreferencesForm } from '../features/user/components/user-preferences';
import { Button } from '../components/ui/button';
import { ArrowLeft } from 'lucide-react';

export const Route = createFileRoute('/_auth/users/$userId')({
  component: UserDetailPage,
});

function UserDetailPage() {
  const { userId } = Route.useParams();
  
  return (
    <div className="space-y-8">
      <div className="flex items-center gap-4">
        <Button variant="outline" size="icon" asChild>
          <Link to="/users">
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">User Details</h1>
          <p className="text-muted-foreground">
            View and manage user information
          </p>
        </div>
      </div>
      
      <Tabs defaultValue="details" className="w-full">
        <TabsList className="mb-4">
          <TabsTrigger value="details">User Details</TabsTrigger>
          <TabsTrigger value="preferences">Preferences</TabsTrigger>
        </TabsList>
        <TabsContent value="details">
          <UserDetail userId={userId} />
        </TabsContent>
        <TabsContent value="preferences">
          <UserPreferencesForm userId={userId} />
        </TabsContent>
      </Tabs>
    </div>
  );
} 
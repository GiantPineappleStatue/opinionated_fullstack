import { useProfile } from '../hooks/use-profile';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../../components/ui/card';
import { AlertCircle } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '../../../components/ui/alert';
import { Skeleton } from '../../../components/ui/skeleton';
import { Avatar, AvatarFallback, AvatarImage } from '../../../components/ui/avatar';
import { Badge } from '../../../components/ui/badge';
import { Separator } from '../../../components/ui/separator';

export function ProfileView() {
  const { profile, user, isLoading, isError } = useProfile();

  const getInitials = (name: string | null) => {
    if (!name) return 'U';
    return name
      .split(' ')
      .map(part => part[0])
      .join('')
      .toUpperCase()
      .substring(0, 2);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <div className="flex items-center gap-4">
            <Skeleton className="h-20 w-20 rounded-full" />
            <div className="space-y-2">
              <Skeleton className="h-6 w-40" />
              <Skeleton className="h-4 w-24" />
            </div>
          </div>
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
          Failed to load profile. Please try again later.
        </AlertDescription>
      </Alert>
    );
  }

  if (!profile || !user) {
    return (
      <Alert>
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>Profile not found</AlertTitle>
        <AlertDescription>
          The profile could not be found.
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-4">
          <Avatar className="h-20 w-20">
            <AvatarImage src={profile.avatarUrl || ''} alt={user.name || 'User'} />
            <AvatarFallback>{getInitials(user.name || null)}</AvatarFallback>
          </Avatar>
          <div>
            <CardTitle className="text-2xl">{user.name || 'Anonymous User'}</CardTitle>
            <CardDescription>{user.email}</CardDescription>
            <div className="mt-2">
              <Badge variant={user.role === 'admin' ? 'default' : 'outline'}>
                {user.role}
              </Badge>
            </div>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {profile.bio && (
          <div>
            <h3 className="text-lg font-medium mb-2">About</h3>
            <p className="text-muted-foreground whitespace-pre-line">{profile.bio}</p>
          </div>
        )}

        {profile.socialLinks && Object.values(profile.socialLinks).some(link => !!link) && (
          <>
            <Separator />
            <div>
              <h3 className="text-lg font-medium mb-4">Social Links</h3>
              <div className="grid gap-2">
                {profile.socialLinks.twitter && (
                  <div className="flex items-center gap-2">
                    <span className="font-medium">Twitter:</span>
                    <a 
                      href={profile.socialLinks.twitter} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-blue-500 hover:underline"
                    >
                      {profile.socialLinks.twitter}
                    </a>
                  </div>
                )}
                {profile.socialLinks.github && (
                  <div className="flex items-center gap-2">
                    <span className="font-medium">GitHub:</span>
                    <a 
                      href={profile.socialLinks.github} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-blue-500 hover:underline"
                    >
                      {profile.socialLinks.github}
                    </a>
                  </div>
                )}
                {profile.socialLinks.linkedin && (
                  <div className="flex items-center gap-2">
                    <span className="font-medium">LinkedIn:</span>
                    <a 
                      href={profile.socialLinks.linkedin} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-blue-500 hover:underline"
                    >
                      {profile.socialLinks.linkedin}
                    </a>
                  </div>
                )}
                {profile.socialLinks.website && (
                  <div className="flex items-center gap-2">
                    <span className="font-medium">Website:</span>
                    <a 
                      href={profile.socialLinks.website} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-blue-500 hover:underline"
                    >
                      {profile.socialLinks.website}
                    </a>
                  </div>
                )}
              </div>
            </div>
          </>
        )}

        <Separator />
        <div className="flex justify-between text-sm text-muted-foreground">
          <div>Member since: {formatDate(user.createdAt)}</div>
          <div>Last updated: {formatDate(profile.updatedAt)}</div>
        </div>
      </CardContent>
    </Card>
  );
} 
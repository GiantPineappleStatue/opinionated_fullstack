import { useState, useEffect } from 'react';
import { useProfile } from '../hooks/use-profile';
import { Button } from '../../../components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '../../../components/ui/card';
import { Input } from '../../../components/ui/input';
import { Label } from '../../../components/ui/label';
import { Textarea } from '../../../components/ui/textarea';
import { AlertCircle, Save, Upload } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '../../../components/ui/alert';
import { Skeleton } from '../../../components/ui/skeleton';
import { Avatar, AvatarFallback, AvatarImage } from '../../../components/ui/avatar';
import { Profile, SocialLinks } from '../api/profile-queries';

export function ProfileForm() {
  const { 
    profile, 
    user,
    isLoading, 
    isError, 
    updateProfile, 
    updateAvatar,
    isUpdateProfilePending,
    isUpdateAvatarPending
  } = useProfile();

  const [form, setForm] = useState<Partial<Profile>>({});
  const [socialLinks, setSocialLinks] = useState<SocialLinks>({});
  const [isDirty, setIsDirty] = useState(false);

  // Initialize form when data is loaded
  useEffect(() => {
    if (profile) {
      setForm({
        bio: profile.bio,
      });
      setSocialLinks(profile.socialLinks || {});
    }
  }, [profile]);

  const handleChange = (field: keyof Profile, value: string) => {
    setForm(prev => ({ ...prev, [field]: value }));
    setIsDirty(true);
  };

  const handleSocialLinkChange = (field: keyof SocialLinks, value: string) => {
    setSocialLinks(prev => ({ ...prev, [field]: value }));
    setIsDirty(true);
  };

  const handleSave = async () => {
    if (isDirty) {
      updateProfile({
        ...form,
        socialLinks
      });
      setIsDirty(false);
    }
  };

  const handleAvatarChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      updateAvatar(file);
    }
  };

  const getInitials = (name: string | null) => {
    if (!name) return 'U';
    return name
      .split(' ')
      .map(part => part[0])
      .join('')
      .toUpperCase()
      .substring(0, 2);
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
          Failed to load profile. Please try again later.
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Profile Information</CardTitle>
        <CardDescription>Update your profile information and how others see you</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="flex items-center gap-4">
          <Avatar className="h-20 w-20">
            <AvatarImage src={profile?.avatarUrl || ''} alt={user?.name || 'User'} />
            <AvatarFallback>{getInitials(user?.name || null)}</AvatarFallback>
          </Avatar>
          <div>
            <Label htmlFor="avatar" className="block mb-2">Profile Picture</Label>
            <div className="flex items-center gap-2">
              <Input 
                id="avatar" 
                type="file" 
                accept="image/*"
                onChange={handleAvatarChange}
                className="w-auto"
              />
              {isUpdateAvatarPending && <Skeleton className="h-4 w-4" />}
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <div>
            <Label htmlFor="bio">Bio</Label>
            <Textarea
              id="bio"
              placeholder="Tell us about yourself"
              value={form.bio || ''}
              onChange={(e) => handleChange('bio', e.target.value)}
              className="resize-none"
              rows={4}
            />
          </div>

          <div className="space-y-4">
            <h3 className="text-lg font-medium">Social Links</h3>
            
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <Label htmlFor="twitter">Twitter</Label>
                <Input
                  id="twitter"
                  placeholder="https://twitter.com/username"
                  value={socialLinks.twitter || ''}
                  onChange={(e) => handleSocialLinkChange('twitter', e.target.value)}
                />
              </div>
              
              <div>
                <Label htmlFor="github">GitHub</Label>
                <Input
                  id="github"
                  placeholder="https://github.com/username"
                  value={socialLinks.github || ''}
                  onChange={(e) => handleSocialLinkChange('github', e.target.value)}
                />
              </div>
              
              <div>
                <Label htmlFor="linkedin">LinkedIn</Label>
                <Input
                  id="linkedin"
                  placeholder="https://linkedin.com/in/username"
                  value={socialLinks.linkedin || ''}
                  onChange={(e) => handleSocialLinkChange('linkedin', e.target.value)}
                />
              </div>
              
              <div>
                <Label htmlFor="website">Website</Label>
                <Input
                  id="website"
                  placeholder="https://example.com"
                  value={socialLinks.website || ''}
                  onChange={(e) => handleSocialLinkChange('website', e.target.value)}
                />
              </div>
            </div>
          </div>
        </div>
      </CardContent>
      <CardFooter>
        <Button 
          onClick={handleSave}
          disabled={!isDirty || isUpdateProfilePending}
          className="ml-auto"
        >
          {isUpdateProfilePending ? (
            <>
              <Skeleton className="h-4 w-4 mr-2" />
              Saving...
            </>
          ) : (
            <>
              <Save className="h-4 w-4 mr-2" />
              Save Profile
            </>
          )}
        </Button>
      </CardFooter>
    </Card>
  );
} 
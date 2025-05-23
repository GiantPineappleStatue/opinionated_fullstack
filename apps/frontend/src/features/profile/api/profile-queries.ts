import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useToast } from '@/hooks/use-toast';
import { api } from '@/lib/api';
import { User } from '../../user/api/user-queries';
import { authKeys } from '@/lib/query-keys';

// Define profile types
export interface Profile {
  id: string;
  userId: string;
  bio: string | null;
  avatarUrl: string | null;
  socialLinks: SocialLinks;
  createdAt: string;
  updatedAt: string;
}

export interface SocialLinks {
  twitter?: string;
  github?: string;
  linkedin?: string;
  website?: string;
}

// Profile API functions
export function useProfileQuery() {
  const queryClient = useQueryClient();
  const toast = useToast();

  // Get current user profile
  const profileQuery = useQuery({
    queryKey: ['profile', 'current'],
    queryFn: async () => {
      const response = await api.get<Profile>('/profile');
      return response;
    },
  });

  // Get current user data
  const userQuery = useQuery({
    queryKey: authKeys.profile.queryKey,
    queryFn: async () => {
      const response = await api.get<User>('/auth/profile');
      return response;
    },
  });

  // Update profile mutation
  const updateProfileMutation = useMutation({
    mutationFn: async (data: Partial<Profile>) => {
      const response = await api.patch<Profile>('/profile', data);
      return response;
    },
    onSuccess: (data) => {
      queryClient.setQueryData(['profile', 'current'], data);
      toast.success({
        message: 'Profile updated',
        description: 'Your profile has been updated successfully.',
      });
    },
    onError: (error) => {
      toast.error({
        message: 'Update failed',
        description: error instanceof Error ? error.message : 'An error occurred while updating your profile.',
      });
    },
  });

  // Update avatar mutation
  const updateAvatarMutation = useMutation({
    mutationFn: async (file: File) => {
      const formData = new FormData();
      formData.append('avatar', file);
      const response = await api.post<{ avatarUrl: string }>('/profile/avatar', formData);
      return response;
    },
    onSuccess: (data) => {
      // Update the profile with the new avatar URL
      queryClient.setQueryData<Profile | undefined>(
        ['profile', 'current'],
        (oldData) => oldData ? { ...oldData, avatarUrl: data.avatarUrl } : undefined
      );
      toast.success({
        message: 'Avatar updated',
        description: 'Your profile picture has been updated successfully.',
      });
    },
    onError: (error) => {
      toast.error({
        message: 'Upload failed',
        description: error instanceof Error ? error.message : 'An error occurred while uploading your avatar.',
      });
    },
  });

  return {
    profile: profileQuery.data,
    user: userQuery.data,
    isLoading: profileQuery.isLoading || userQuery.isLoading,
    isError: profileQuery.isError || userQuery.isError,
    updateProfile: updateProfileMutation.mutate,
    updateAvatar: updateAvatarMutation.mutate,
    isUpdateProfilePending: updateProfileMutation.isPending,
    isUpdateAvatarPending: updateAvatarMutation.isPending,
  };
} 
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '../api-client';
import { toast } from 'sonner';

export const authKeys = {
  user: ['user'] as const,
  preferences: ['preferences'] as const,
  notifications: ['notifications'] as const,
};

export function useUserQuery() {
  return useQuery({
    queryKey: authKeys.user,
    queryFn: () => apiClient.getUser(),
  });
}

export function useUserPreferencesQuery() {
  return useQuery({
    queryKey: authKeys.preferences,
    queryFn: () => apiClient.getUserPreferences(),
  });
}

export function useUserNotificationsQuery() {
  return useQuery({
    queryKey: authKeys.notifications,
    queryFn: () => apiClient.getUserNotifications(),
  });
}

export function useUpdateUserPreferencesMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: apiClient.updateUserPreferences,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: authKeys.preferences });
      toast.success('Preferences updated successfully');
    },
    onError: (error) => {
      toast.error('Failed to update preferences');
      console.error('Update preferences error:', error);
    },
  });
}

export function useUpdateUserNotificationsMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: apiClient.updateUserNotifications,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: authKeys.notifications });
      toast.success('Notification settings updated successfully');
    },
    onError: (error) => {
      toast.error('Failed to update notification settings');
      console.error('Update notifications error:', error);
    },
  });
} 
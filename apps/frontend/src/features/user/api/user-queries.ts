import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { queryKeys } from '@/lib/query/query-keys';
import { useToast } from '@/hooks/use-toast';
import { ApiClient } from '@/lib/api';

// Create a singleton instance of the API client
const apiClient = new ApiClient();

// Define user types
export interface User {
  id: string;
  email: string;
  name: string | null;
  role: string;
  createdAt: string;
  updatedAt: string;
}

export interface UserPreferences {
  id: string;
  userId: string;
  theme: 'light' | 'dark' | 'system';
  notifications: boolean;
  updatedAt: string;
}

// User API functions
export function useUserQuery(userId: string) {
  const queryClient = useQueryClient();
  const toast = useToast();

  // Get user by ID
  const userQuery = useQuery({
    queryKey: queryKeys.users.detail(userId).queryKey,
    queryFn: async () => {
      const response = await apiClient.get<User>(`/users/${userId}`);
      return response;
    },
    enabled: !!userId,
  });

  // Get user preferences
  const preferencesQuery = useQuery({
    queryKey: queryKeys.users.preferences(userId).queryKey,
    queryFn: async () => {
      const response = await apiClient.get<UserPreferences>(`/users/${userId}/preferences`);
      return response;
    },
    enabled: !!userId,
  });

  // Update user mutation
  const updateUserMutation = useMutation({
    mutationFn: async (data: Partial<User>) => {
      const response = await apiClient.patch<User>(`/users/${userId}`, data);
      return response;
    },
    onSuccess: (data) => {
      queryClient.setQueryData(queryKeys.users.detail(userId).queryKey, data);
      toast.success({
        message: 'User updated',
        description: 'User information has been updated successfully.',
      });
    },
    onError: (error) => {
      toast.error({
        message: 'Update failed',
        description: error instanceof Error ? error.message : 'An error occurred',
      });
    },
  });

  // Update user preferences mutation
  const updatePreferencesMutation = useMutation({
    mutationFn: async (data: Partial<UserPreferences>) => {
      const response = await apiClient.patch<UserPreferences>(`/users/${userId}/preferences`, data);
      return response;
    },
    onSuccess: (data) => {
      queryClient.setQueryData(queryKeys.users.preferences(userId).queryKey, data);
      toast.success({
        message: 'Preferences updated',
        description: 'User preferences have been updated successfully.',
      });
    },
    onError: (error) => {
      toast.error({
        message: 'Update failed',
        description: error instanceof Error ? error.message : 'An error occurred',
      });
    },
  });

  return {
    user: userQuery.data,
    preferences: preferencesQuery.data,
    isLoading: userQuery.isLoading || preferencesQuery.isLoading,
    isError: userQuery.isError || preferencesQuery.isError,
    updateUser: updateUserMutation.mutate,
    updatePreferences: updatePreferencesMutation.mutate,
    isUpdateUserPending: updateUserMutation.isPending,
    isUpdatePreferencesPending: updatePreferencesMutation.isPending,
  };
}

// List users (admin only)
export function useUsersListQuery() {
  const toast = useToast();

  const usersQuery = useQuery({
    queryKey: queryKeys.users.list.queryKey,
    queryFn: async () => {
      const response = await apiClient.get<User[]>('/admin/users');
      return response;
    },
  });

  // Promote user to admin mutation
  const promoteUserMutation = useMutation({
    mutationFn: async (userId: string) => {
      const response = await apiClient.post<User>(`/admin/users/${userId}/promote`, {});
      return response;
    },
    onSuccess: () => {
      // Invalidate the users list query to refetch the updated data
      usersQuery.refetch();
      toast.success({
        message: 'User promoted',
        description: 'User has been promoted to admin successfully.',
      });
    },
    onError: (error) => {
      toast.error({
        message: 'Promotion failed',
        description: error instanceof Error ? error.message : 'An error occurred',
      });
    },
  });

  return {
    users: usersQuery.data,
    isLoading: usersQuery.isLoading,
    isError: usersQuery.isError,
    refetch: usersQuery.refetch,
    promoteUser: promoteUserMutation.mutate,
    isPromoteUserPending: promoteUserMutation.isPending,
  };
} 
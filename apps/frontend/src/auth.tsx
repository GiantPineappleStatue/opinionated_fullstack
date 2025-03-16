import * as React from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { User, ApiResponseV2 } from '@repo/shared-types'
import { api } from '@/lib/api'
import type { AxiosError, AxiosResponse } from 'axios'
import { env } from '@/env'

export interface AuthContextInterface {
  isAuthenticated: boolean
  login: (credentials: { email: string; password: string }) => Promise<void>
  logout: () => Promise<void>
  user: User | null
  isLoading: boolean
  isLoginLoading: boolean
}

const AuthContext = React.createContext<AuthContextInterface | null>(null)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const queryClient = useQueryClient()
  const [isAuthenticated, setIsAuthenticated] = React.useState(false)

  const { data: user, isLoading, refetch: refetchProfile } = useQuery({
    queryKey: ['auth', 'profile'],
    queryFn: async () => {
      const url = `${env.VITE_API_URL}/auth/profile`
      try {
        const response: AxiosResponse<ApiResponseV2<User>> = await api.get(url)
        setIsAuthenticated(true)
        return response.data.data
      } catch (error) {
        if ((error as AxiosError).response?.status === 401) {
          setIsAuthenticated(false)
          return null
        }
        throw error
      }
    },
    retry: (failureCount, error) => {
      if ((error as AxiosError).response?.status === 401) return false
      return failureCount < 3
    }
  })

  const loginMutation = useMutation({
    mutationFn: async (credentials: { email: string; password: string }) => {
      const url = `${env.VITE_API_URL}/api/auth/login`
      const response: AxiosResponse<ApiResponseV2<User>> = await api.post(url, credentials)
      return response.data.data
    },
    onSuccess: async (data) => {
      queryClient.setQueryData(['auth', 'profile'], data)
      setIsAuthenticated(true)
      await refetchProfile()
    },
    onError: () => {
      setIsAuthenticated(false)
      queryClient.setQueryData(['auth', 'profile'], null)
    },
  })

  const logoutMutation = useMutation({
    mutationFn: async () => {
      const url = `${env.VITE_API_URL}/api/auth/logout`
      await api.post(url)
    },
    onSuccess: () => {
      setIsAuthenticated(false)
      queryClient.setQueryData(['auth', 'profile'], null)
      refetchProfile()
    },
  })

  const login = async (credentials: { email: string; password: string }) => {
    await loginMutation.mutateAsync(credentials)
  }

  const logout = async () => {
    await logoutMutation.mutateAsync()
  }

  // Sync auth state with user data
  React.useEffect(() => {
    if (user) {
      setIsAuthenticated(true)
    } else if (!isLoading) {
      setIsAuthenticated(false)
    }
  }, [user, isLoading])

  const value = React.useMemo(
    () => ({
      isAuthenticated,
      user: user ?? null,
      isLoading,
      isLoginLoading: loginMutation.isPending,
      login,
      logout,
    }),
    [user, isLoading, login, logout, isAuthenticated, loginMutation.isPending]
  )

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = React.useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

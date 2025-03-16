import { createFileRoute, useNavigate, redirect, Link } from '@tanstack/react-router';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { LoginRequestV2 } from '@repo/shared-types';
import { useAuth } from '@/auth';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2 } from 'lucide-react';
import { AuthContextInterface } from '@/auth';
import { useState } from 'react';

const formSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
});

export const Route = createFileRoute('/login')({
  beforeLoad: ({ context }) => {
    if (!context.auth) {
      console.log('Auth context not available in route');
      return;
    }
    
    const auth = context.auth as AuthContextInterface;
    console.log('Login route: Checking auth state:', {
      isAuthenticated: auth.isAuthenticated,
      isLoading: auth.isLoading
    });
    
    // If we're still loading, don't redirect yet
    if (auth.isLoading) {
      return;
    }
    
    // Redirect to dashboard if already authenticated
    if (auth.isAuthenticated) {
      console.log('Login route: User already authenticated, redirecting to dashboard');
      throw redirect({
        to: '/dashboard',        
        search: {
          redirect: location.href,
        },
      });
    }
  },
  component: LoginPage,
});

export default function LoginPage() {
  const { login } = useAuth();

  const form = useForm<LoginRequestV2>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  });

  const onSubmit = async (data: LoginRequestV2) => {
    try {
      // The login mutation from auth context handles navigation and error toasts
      await login(data);
    } catch (error) {
      // Error is handled by the mutation's onError callback
      console.error('Login error:', error);
    }
  };

  const isSubmitting = form.formState.isSubmitting;

  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-2xl font-bold">Login</CardTitle>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <Input
                        type="email"
                        placeholder="Enter your email"
                        {...field}
                        disabled={isSubmitting}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Password</FormLabel>
                    <FormControl>
                      <Input
                        type="password"
                        placeholder="Enter your password"
                        {...field}
                        disabled={isSubmitting}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button
                type="submit"
                className="w-full"
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Logging in...
                  </>
                ) : (
                  'Login'
                )}
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
} 
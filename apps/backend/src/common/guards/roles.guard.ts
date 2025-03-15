import { Injectable, CanActivate, ExecutionContext, ForbiddenException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Request } from 'express';

export enum UserRole {
  USER = 'user',
  ADMIN = 'admin',
}

export const ROLES_KEY = 'roles';

export const Roles = (...roles: UserRole[]) => {
  return (target: any, key?: string, descriptor?: any) => {
    Reflect.defineMetadata(ROLES_KEY, roles, descriptor ? descriptor.value : target);
    return descriptor ? descriptor : target;
  };
};

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const requiredRoles = this.reflector.getAllAndOverride<UserRole[]>(ROLES_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    // If no roles are required, allow access
    if (!requiredRoles || requiredRoles.length === 0) {
      return true;
    }

    const request = context.switchToHttp().getRequest<Request>();
    
    // First check if user is in the request object (set by AuthGuard from token)
    if (request.user) {
      // Check if user has required role
      const userRole = (request.user as { role: UserRole }).role;
      const hasRole = requiredRoles.some(role => userRole === role);
      
      if (!hasRole) {
        throw new ForbiddenException('You do not have permission to access this resource');
      }
      
      return true;
    }
    
    // Fall back to session-based authentication
    if (!request.session || !request.session.user) {
      throw new ForbiddenException('You must be logged in to access this resource');
    }

    // Get user from session
    const user = request.session.user;
    
    // Check if user has required role
    const hasRole = requiredRoles.some(role => user.role === role);
    
    if (!hasRole) {
      throw new ForbiddenException('You do not have permission to access this resource');
    }
    
    return true;
  }
} 
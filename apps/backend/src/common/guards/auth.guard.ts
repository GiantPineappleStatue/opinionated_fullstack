import { Injectable, CanActivate, ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Request } from 'express';
import { IS_PUBLIC_KEY } from '../decorators/public.decorator';
import { JwtService } from '../../auth/jwt.service';
import { UserRole } from './roles.guard';

// Cookie name for access token
const ACCESS_TOKEN_COOKIE = 'access_token';

// Extend the Express Request type to include user property
declare module 'express' {
  interface Request {
    user?: {
      id: string;
      email: string;
      role: UserRole;
    };
  }
}

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(
    private reflector: Reflector,
    private jwtService: JwtService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    // Check if the route is marked as public
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    // If route is public, allow access
    if (isPublic) {
      return true;
    }

    const request = context.switchToHttp().getRequest<Request>();
    
    // First try token-based authentication
    const accessToken = request.cookies[ACCESS_TOKEN_COOKIE];
    
    if (accessToken) {
      const payload = await this.jwtService.validateAccessToken(accessToken);
      
      if (payload) {
        // Set user info in request for use in controllers
        request.user = {
          id: payload.sub,
          email: payload.email,
          role: payload.role,
        };
        
        // For backward compatibility, also set session data
        if (request.session) {
          request.session.userId = payload.sub;
          request.session.user = request.user;
        }
        
        return true;
      }
    }
    
    // Fall back to session-based authentication
    if (request.session && request.session.userId) {
      return true;
    }
    
    throw new UnauthorizedException('You must be logged in to access this resource');
  }
} 
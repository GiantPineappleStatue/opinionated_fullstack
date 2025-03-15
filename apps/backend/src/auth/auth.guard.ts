import { Injectable, CanActivate, ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { Request } from 'express';

@Injectable()
export class AuthGuard implements CanActivate {
  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<Request>();
    
    // Check if session exists and has a userId
    if (!request.session || !request.session['userId']) {
      throw new UnauthorizedException('User is not authenticated');
    }
    
    return true;
  }
} 
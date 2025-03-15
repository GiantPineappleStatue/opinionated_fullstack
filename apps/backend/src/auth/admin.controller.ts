import { Controller, Get, UseGuards, Req, HttpStatus } from '@nestjs/common';
import { AuthGuard } from '../common/guards/auth.guard';
import { RolesGuard, Roles, UserRole } from '../common/guards/roles.guard';
import { ApiTags, ApiOperation, ApiResponse, ApiCookieAuth } from '@nestjs/swagger';
import { Request } from 'express';
import { ApiResponseV2 } from '@repo/shared-types';
import { AuthService } from './auth.service';

interface TeamMember {
  id: string;
  name: string;
  email: string;
  role: string;
}

@ApiTags('admin')
@Controller('admin')
@UseGuards(AuthGuard, RolesGuard)
export class AdminController {
  constructor(private readonly authService: AuthService) {}

  @Get('team')
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Get team members', description: 'Get a list of team members (admin only)' })
  @ApiCookieAuth()
  @ApiResponse({ 
    status: HttpStatus.OK, 
    description: 'Team members retrieved successfully',
    schema: {
      example: {
        data: [
          { id: '1', name: 'John Doe', email: 'john@example.com', role: 'admin' },
          { id: '2', name: 'Jane Smith', email: 'jane@example.com', role: 'user' },
        ],
        status: 200,
        message: 'Team members retrieved successfully'
      }
    }
  })
  @ApiResponse({ status: HttpStatus.UNAUTHORIZED, description: 'Not authenticated' })
  @ApiResponse({ status: HttpStatus.FORBIDDEN, description: 'Not authorized' })
  async getTeamMembers(@Req() req: Request): Promise<ApiResponseV2<TeamMember[]>> {
    // In a real application, this would fetch team members from the database
    // For this mock implementation, we'll return a static list
    
    // Mock team members data
    const teamMembers: TeamMember[] = [
      { id: '1', name: 'Alice Admin', email: 'admin@example.com', role: 'admin' },
      { id: '2', name: 'Bob User', email: 'user1@example.com', role: 'user' },
      { id: '3', name: 'Carol User', email: 'user2@example.com', role: 'user' },
      { id: '4', name: 'Dave User', email: 'user3@example.com', role: 'user' },
    ];

    return {
      data: teamMembers,
      status: HttpStatus.OK,
      message: 'Team members retrieved successfully',
    };
  }
} 
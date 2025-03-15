import {
  Controller,
  Get,
  Post,
  Param,
  Req,
  HttpStatus,
  UnauthorizedException,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { Roles } from '../common/decorators/roles.decorator';
import { UserRole } from '../common/guards/roles.guard';
import { AdminService } from './admin.service';

@ApiTags('admin')
@Controller('admin')
@Roles(UserRole.ADMIN)
export class AdminController {
  constructor(private readonly adminService: AdminService) {}

  @Get('users')
  @ApiOperation({ summary: 'Get all users (Admin only)' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'List of all users',
  })
  @ApiResponse({
    status: HttpStatus.UNAUTHORIZED,
    description: 'Not authenticated',
  })
  @ApiResponse({
    status: HttpStatus.FORBIDDEN,
    description: 'Not authorized (Admin role required)',
  })
  async getAllUsers() {
    return this.adminService.getAllUsers();
  }

  @Post('users/:userId/promote')
  @ApiOperation({ summary: 'Promote user to admin (Admin only)' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'User promoted to admin',
  })
  @ApiResponse({
    status: HttpStatus.UNAUTHORIZED,
    description: 'Not authenticated',
  })
  @ApiResponse({
    status: HttpStatus.FORBIDDEN,
    description: 'Not authorized (Admin role required)',
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'User not found',
  })
  async promoteUser(@Param('userId') userId: string, @Req() req: any) {
    if (!req.session.userId) {
      throw new UnauthorizedException('Not authenticated');
    }
    return this.adminService.promoteUserToAdmin(userId, req.session.userId);
  }
} 
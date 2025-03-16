import { Controller, Get, Patch, Body, Req, UseGuards, HttpStatus, Post, UseInterceptors, UploadedFile, BadRequestException } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiCookieAuth, ApiConsumes } from '@nestjs/swagger';
import { Request } from 'express';
import { FileInterceptor } from '@nestjs/platform-express';
import { ProfileService, Profile } from './profile.service';
import { AuthGuard } from '../common/guards/auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { ApiResponseV2 } from '@repo/shared-types';

@ApiTags('profile')
@Controller('profile')
@UseGuards(AuthGuard, RolesGuard)
export class ProfileController {
  constructor(private readonly profileService: ProfileService) {}

  @Get()
  @ApiOperation({ summary: 'Get user profile', description: 'Get the current user\'s extended profile information' })
  @ApiCookieAuth()
  @ApiResponse({ 
    status: HttpStatus.OK, 
    description: 'Profile retrieved successfully',
    schema: { 
      example: {
        data: {
          id: '1',
          userId: '1',
          bio: 'Software developer passionate about web technologies',
          avatarUrl: 'https://example.com/avatar.jpg',
          socialLinks: {
            twitter: 'https://twitter.com/username',
            github: 'https://github.com/username',
            linkedin: 'https://linkedin.com/in/username',
            website: 'https://example.com'
          },
          createdAt: '2023-01-01T00:00:00.000Z',
          updatedAt: '2023-01-01T00:00:00.000Z'
        },
        status: 200,
        message: 'Profile retrieved successfully'
      }
    }
  })
  @ApiResponse({ 
    status: HttpStatus.UNAUTHORIZED, 
    description: 'Not authenticated',
    schema: { 
      example: {
        data: null,
        status: 401,
        message: 'Authentication required',
        error: {
          code: 'UNAUTHORIZED',
          message: 'Authentication required'
        }
      }
    }
  })
  async getProfile(@Req() req: Request): Promise<ApiResponseV2<Profile>> {
    const profile = await this.profileService.getProfile(req);
    return {
      data: profile,
      status: HttpStatus.OK,
      message: 'Profile retrieved successfully',
    };
  }

  @Patch()
  @ApiOperation({ summary: 'Update user profile', description: 'Update the current user\'s extended profile information' })
  @ApiCookieAuth()
  @ApiResponse({ 
    status: HttpStatus.OK, 
    description: 'Profile updated successfully',
    schema: {
      example: {
        data: {
          id: '1',
          userId: '1',
          bio: 'Updated bio',
          avatarUrl: 'https://example.com/new-avatar.jpg',
          socialLinks: {
            twitter: 'https://twitter.com/newusername',
            github: 'https://github.com/newusername'
          },
          createdAt: '2023-01-01T00:00:00.000Z',
          updatedAt: '2023-01-02T00:00:00.000Z'
        },
        status: 200,
        message: 'Profile updated successfully'
      }
    }
  })
  @ApiResponse({ status: HttpStatus.UNAUTHORIZED, description: 'Not authenticated' })
  @ApiResponse({ status: HttpStatus.BAD_REQUEST, description: 'Invalid input' })
  async updateProfile(
    @Req() req: Request,
    @Body() updateData: Partial<Profile>
  ): Promise<ApiResponseV2<Profile>> {
    const profile = await this.profileService.updateProfile(req, updateData);
    return {
      data: profile,
      status: HttpStatus.OK,
      message: 'Profile updated successfully',
    };
  }

  @Post('avatar')
  @ApiOperation({ summary: 'Upload avatar', description: 'Upload a new avatar image for the current user' })
  @ApiConsumes('multipart/form-data')
  @ApiCookieAuth()
  @UseInterceptors(FileInterceptor('avatar'))
  async uploadAvatar(
    @Req() req: Request,
    @UploadedFile() file: any
  ): Promise<ApiResponseV2<{ avatarUrl: string }>> {
    if (!file) {
      throw new BadRequestException('No file uploaded');
    }
    const avatarUrl = await this.profileService.uploadAvatar(req, file);
    return {
      data: { avatarUrl },
      status: HttpStatus.OK,
      message: 'Avatar uploaded successfully',
    };
  }
} 
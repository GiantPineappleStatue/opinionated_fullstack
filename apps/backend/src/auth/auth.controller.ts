import { 
  Body, 
  Controller, 
  Post, 
  HttpCode, 
  HttpStatus, 
  Req, 
  Res, 
  Get,
  UseGuards,
  Patch,
  Delete,
  Query,
  UnauthorizedException
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { 
  LoginRequestV2, 
  RegisterRequestV2, 
  AuthResponseDto, 
  ApiResponseV2,
  UserRole
} from '@repo/shared-types';
import { Request, Response } from 'express';
import { AuthGuard } from '../common/guards/auth.guard';
import { ApiTags, ApiOperation, ApiResponse, ApiBody, ApiCookieAuth, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { Public } from '../common/decorators/public.decorator';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/guards/roles.guard';
import { ApiResponseWithError } from '../common/types/api-response';
import { Logger } from '@nestjs/common';

// Define types for account management
interface UpdateProfileRequest {
  name?: string;
  email?: string;
}

interface ChangePasswordRequest {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

interface DeleteAccountRequest {
  password: string;
  confirmation: string;
}

// Define types for email verification
interface VerifyEmailRequest {
  token: string;
}

@ApiTags('auth')
@Controller('auth')
@UseGuards(AuthGuard, RolesGuard)
export class AuthController {
  private readonly logger = new Logger(AuthController.name);

  constructor(private readonly authService: AuthService) {}

  @Public()
  @Post('login')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'User login', description: 'Authenticate a user with email and password' })
  @ApiBody({ type: Object, schema: { 
    example: { 
      email: 'user@example.com', 
      password: 'password123' 
    } 
  }})
  @ApiResponse({ 
    status: HttpStatus.OK, 
    description: 'Login successful',
    schema: {
      example: {
        data: {
          user: {
            id: '1',
            email: 'user@example.com',
            name: 'John Doe',
            role: 'user'
          }
        },
        status: 200,
        message: 'Login successful'
      }
    }
  })
  @ApiResponse({ status: HttpStatus.UNAUTHORIZED, description: 'Invalid credentials' })
  async login(
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
    @Body() loginData: LoginRequestV2
  ): Promise<ApiResponseV2<AuthResponseDto>> {
    this.logger.debug('=== LOGIN ENDPOINT START ===');
    this.logger.debug('Raw request body:', req.body);
    this.logger.debug('Content-Type:', req.headers['content-type']);
    this.logger.debug('Request method:', req.method);
    this.logger.debug('Request URL:', req.url);
    this.logger.debug('Login data from @Body():', loginData);
    this.logger.debug('Headers:', req.headers);
    this.logger.debug('=== LOGIN ENDPOINT DATA END ===');

    console.log('[AuthController] Login request received:', { 
      email: loginData.email,
      hasPassword: !!loginData.password,
      headers: {
        'content-type': req.headers['content-type'],
        'cookie': req.headers['cookie'],
        'origin': req.headers['origin']
      },
      cookies: req.cookies,
      sessionID: req.sessionID,
      body: req.body,
      method: req.method,
      url: req.url,
      rawBody: req.body
    });
    
    try {
      console.log('[AuthController] Validating login data:', {
        email: loginData.email,
        passwordLength: loginData.password?.length
      });

      if (!loginData.email || !loginData.password) {
        console.error('[AuthController] Missing required login fields:', {
          hasEmail: !!loginData.email,
          hasPassword: !!loginData.password
        });
        throw new UnauthorizedException('Email and password are required');
      }

      console.log('[AuthController] Calling auth service login');
      const result = await this.authService.login(req, res, loginData);
      
      console.log('[AuthController] Login successful:', { 
        userId: result.user.id,
        email: result.user.email,
        sessionID: req.sessionID,
        cookies: res.getHeader('set-cookie')
      });
      
      return {
        data: {
          id: result.user.id,
          email: result.user.email,
          name: result.user.name || '',
          role: UserRole.USER,
          emailVerified: result.user.emailVerified
        },
        status: HttpStatus.OK,
        message: 'Login successful',
      };
    } catch (error) {
      console.error('[AuthController] Login failed:', {
        email: loginData.email,
        error: error.message,
        stack: error.stack,
        type: error.constructor.name
      });
      throw error;
    }
  }

  @Public()
  @Post('register')
  @ApiOperation({ summary: 'User registration', description: 'Register a new user account' })
  @ApiBody({ type: Object, schema: { 
    example: { 
      email: 'newuser@example.com', 
      password: 'password123',
      name: 'New User'
    } 
  }})
  @ApiResponse({ 
    status: HttpStatus.CREATED, 
    description: 'Registration successful',
    schema: {
      example: {
        data: {
          user: {
            id: '2',
            email: 'newuser@example.com',
            name: 'New User',
            role: 'user'
          }
        },
        status: 201,
        message: 'Registration successful'
      }
    }
  })
  @ApiResponse({ status: HttpStatus.BAD_REQUEST, description: 'Invalid input or email already exists' })
  async register(
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
    @Body() registerData: RegisterRequestV2
  ): Promise<ApiResponseV2<AuthResponseDto>> {
    const result = await this.authService.register(req, res, registerData);
    return {
      data: {
        id: result.user.id,
        email: result.user.email,
        name: result.user.name || '',
        role: UserRole.USER,
        emailVerified: result.user.emailVerified
      },
      status: HttpStatus.CREATED,
      message: 'Registration successful',
    };
  }

  @Post('logout')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'User logout', description: 'Log out the current user and clear session' })
  @ApiCookieAuth()
  @ApiResponse({ 
    status: HttpStatus.OK, 
    description: 'Logout successful',
    schema: {
      example: {
        data: null,
        status: 200,
        message: 'Logout successful'
      }
    }
  })
  async logout(
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response
  ): Promise<ApiResponseV2<null>> {
    await this.authService.logout(req, res);
    return {
      data: null,
      status: HttpStatus.OK,
      message: 'Logout successful',
    };
  }

  @Get('profile')
  @ApiOperation({ summary: 'Get user profile', description: 'Get the current user\'s profile information' })
  @ApiCookieAuth()
  @ApiResponse({ 
    status: HttpStatus.OK, 
    description: 'Profile retrieved successfully',
    schema: { 
      example: {
        data: {
          id: '1',
          email: 'user@example.com',
          name: 'John Doe',
          role: 'user',
          createdAt: '2023-01-01T00:00:00.000Z',
          updatedAt: '2023-01-01T00:00:00.000Z',
          emailVerified: true
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
  async getProfile(@Req() req: Request): Promise<ApiResponseV2<any> | ApiResponseWithError<any>> {
    console.log('[AuthController] Profile request received:', {
      sessionID: req.sessionID,
      cookies: req.cookies,
      headers: req.headers,
      session: req.session
    });

    try {
      const user = await this.authService.getProfile(req);
      console.log('[AuthController] Profile retrieved successfully:', {
        userId: user.id,
        email: user.email,
        sessionID: req.sessionID
      });
      return {
        data: user,
        status: HttpStatus.OK,
        message: 'Profile retrieved successfully',
      };
    } catch (error) {
      console.error('[AuthController] Profile retrieval failed:', {
        error: error.message,
        stack: error.stack,
        sessionID: req.sessionID
      });
      // Handle unauthorized errors with proper response format instead of throwing
      if (error instanceof UnauthorizedException) {
        return ApiResponseWithError.unauthorized(
          'Authentication required',
          error.message || 'You must be logged in to access this resource'
        );
      }
      // For other errors, rethrow
      throw error;
    }
  }

  @Patch('profile')
  @ApiOperation({ summary: 'Update user profile', description: 'Update the current user\'s profile information' })
  @ApiCookieAuth()
  @ApiBody({ type: Object, schema: { 
    example: { 
      name: 'Updated Name',
      email: 'updated.email@example.com'
    } 
  }})
  @ApiResponse({ 
    status: HttpStatus.OK, 
    description: 'Profile updated successfully',
    schema: {
      example: {
        data: {
          id: '1',
          email: 'updated.email@example.com',
          name: 'Updated Name',
          createdAt: '2023-01-01T00:00:00.000Z',
          updatedAt: '2023-01-02T00:00:00.000Z'
        },
        status: 200,
        message: 'Profile updated successfully'
      }
    }
  })
  @ApiResponse({ status: HttpStatus.UNAUTHORIZED, description: 'Not authenticated' })
  @ApiResponse({ status: HttpStatus.BAD_REQUEST, description: 'Invalid input or email already in use' })
  async updateProfile(
    @Req() req: Request,
    @Body() updateData: UpdateProfileRequest
  ): Promise<ApiResponseV2<any>> {
    const updatedUser = await this.authService.updateProfile(req, updateData);
    return {
      data: updatedUser.toResponseObject(),
      status: HttpStatus.OK,
      message: 'Profile updated successfully',
    };
  }

  @Post('change-password')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Change password', description: 'Change the current user\'s password' })
  @ApiCookieAuth()
  @ApiBody({ type: Object, schema: { 
    example: { 
      currentPassword: 'oldPassword123',
      newPassword: 'newPassword123',
      confirmPassword: 'newPassword123'
    } 
  }})
  @ApiResponse({ 
    status: HttpStatus.OK, 
    description: 'Password changed successfully',
    schema: {
      example: {
        data: null,
        status: 200,
        message: 'Password changed successfully'
      }
    }
  })
  @ApiResponse({ status: HttpStatus.UNAUTHORIZED, description: 'Not authenticated' })
  @ApiResponse({ status: HttpStatus.BAD_REQUEST, description: 'Current password is incorrect or passwords don\'t match' })
  async changePassword(
    @Req() req: Request,
    @Body() changeData: ChangePasswordRequest
  ): Promise<ApiResponseV2<null>> {
    await this.authService.changePassword(req, {
      currentPassword: changeData.currentPassword,
      newPassword: changeData.newPassword
    });
    return {
      data: null,
      status: HttpStatus.OK,
      message: 'Password changed successfully',
    };
  }

  @Delete('account')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Delete account', description: 'Permanently delete the current user\'s account' })
  @ApiCookieAuth()
  @ApiBody({ type: Object, schema: { 
    example: { 
      password: 'password123',
      confirmation: 'DELETE'
    } 
  }})
  @ApiResponse({ 
    status: HttpStatus.OK, 
    description: 'Account deleted successfully',
    schema: {
      example: {
        data: null,
        status: 200,
        message: 'Account deleted successfully'
      }
    }
  })
  @ApiResponse({ status: HttpStatus.UNAUTHORIZED, description: 'Not authenticated' })
  @ApiResponse({ status: HttpStatus.BAD_REQUEST, description: 'Password is incorrect or confirmation is invalid' })
  async deleteAccount(
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
    @Body() deleteData: DeleteAccountRequest
  ): Promise<ApiResponseV2<null>> {
    await this.authService.deleteAccount(req, res, {
      password: deleteData.password
    });
    return {
      data: null,
      status: HttpStatus.OK,
      message: 'Account deleted successfully',
    };
  }

  @Public()
  @Post('refresh')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ 
    summary: 'Refresh access token', 
    description: 'Get a new access token using the refresh token cookie' 
  })
  @ApiCookieAuth()
  @ApiResponse({ 
    status: HttpStatus.OK, 
    description: 'Token refreshed successfully',
    schema: {
      example: {
        data: null,
        status: 200,
        message: 'Token refreshed successfully'
      }
    }
  })
  @ApiResponse({ status: HttpStatus.UNAUTHORIZED, description: 'Invalid or expired refresh token' })
  async refreshToken(
    @Req() req: Request,
    @Res() res: Response
  ): Promise<void> {
    await this.authService.refreshTokens(req, res);
  }

  @Get('admin-profile')
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Get admin profile', description: 'Retrieve the admin profile information (admin only)' })
  @ApiCookieAuth()
  @ApiResponse({ 
    status: HttpStatus.OK, 
    description: 'Admin profile retrieved successfully',
    schema: {
      example: {
        data: {
          id: '1',
          email: 'admin@example.com',
          name: 'Admin User',
          role: 'admin',
          createdAt: '2023-01-01T00:00:00.000Z'
        },
        status: 200,
        message: 'Admin profile retrieved successfully'
      }
    }
  })
  @ApiResponse({ status: HttpStatus.UNAUTHORIZED, description: 'Not authenticated' })
  @ApiResponse({ status: HttpStatus.FORBIDDEN, description: 'Not authorized' })
  async getAdminProfile(@Req() req: Request): Promise<ApiResponseV2<any>> {
    const user = await this.authService.getProfile(req);
    return {
      data: user,
      status: HttpStatus.OK,
      message: 'Admin profile retrieved successfully',
    };
  }

  @Public()
  @Get('verify-email')
  @ApiOperation({ summary: 'Verify email', description: 'Verify user email with token' })
  @ApiQuery({ name: 'token', required: true, description: 'Email verification token' })
  @ApiResponse({ 
    status: HttpStatus.OK, 
    description: 'Email verified successfully',
    schema: {
      example: {
        data: { verified: true },
        status: 200,
        message: 'Email verified successfully'
      }
    }
  })
  @ApiResponse({ status: HttpStatus.BAD_REQUEST, description: 'Invalid or expired token' })
  async verifyEmail(@Query('token') token: string): Promise<ApiResponseV2<{ verified: boolean }>> {
    const verified = await this.authService.verifyEmail(token);
    return {
      data: { verified },
      status: HttpStatus.OK,
      message: 'Email verified successfully',
    };
  }

  @Post('resend-verification')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Resend verification email', description: 'Resend the email verification link' })
  @ApiCookieAuth()
  @ApiResponse({ 
    status: HttpStatus.OK, 
    description: 'Verification email sent',
    schema: {
      example: {
        data: null,
        status: 200,
        message: 'Verification email sent'
      }
    }
  })
  @ApiResponse({ status: HttpStatus.BAD_REQUEST, description: 'Email already verified' })
  @ApiResponse({ status: HttpStatus.UNAUTHORIZED, description: 'Not authenticated' })
  async resendVerification(@Req() req: Request): Promise<ApiResponseV2<null>> {
    await this.authService.resendVerificationEmail(req);
    return {
      data: null,
      status: HttpStatus.OK,
      message: 'Verification email sent',
    };
  }

  @Get('email-status')
  @ApiOperation({ summary: 'Get email verification status', description: 'Check if the user\'s email is verified' })
  @ApiCookieAuth()
  @ApiResponse({ 
    status: HttpStatus.OK, 
    description: 'Email verification status',
    schema: {
      example: {
        data: { verified: true },
        status: 200,
        message: 'Email verification status'
      }
    }
  })
  @ApiResponse({ status: HttpStatus.UNAUTHORIZED, description: 'Not authenticated' })
  async getEmailStatus(@Req() req: Request): Promise<ApiResponseV2<{ verified: boolean }>> {
    const userId = await this.authService.extractUserId(req);
    if (!userId) {
      throw new UnauthorizedException('Not authenticated');
    }
    
    const verified = await this.authService.isEmailVerified(userId);
    return {
      data: { verified },
      status: HttpStatus.OK,
      message: 'Email verification status',
    };
  }

  @Public()
  @Post('test')
  @HttpCode(HttpStatus.OK)
  async test(@Req() req: Request, @Body() body: any) {
    this.logger.debug('=== TEST ENDPOINT HIT ===');
    this.logger.debug('Request method:', req.method);
    this.logger.debug('Request URL:', req.url);
    this.logger.debug('Headers:', req.headers);
    this.logger.debug('Body:', body);
    this.logger.debug('Raw body:', req.body);
    this.logger.debug('=== TEST ENDPOINT END ===');

    return {
      message: 'Test endpoint working',
      received: {
        method: req.method,
        url: req.url,
        body: body,
        headers: req.headers
      }
    };
  }

  @Public()
  @Get('test')
  async testGet(@Req() req: Request) {
    this.logger.debug('=== TEST GET ENDPOINT HIT ===');
    this.logger.debug('Request method:', req.method);
    this.logger.debug('Request URL:', req.url);
    this.logger.debug('Headers:', req.headers);
    this.logger.debug('=== TEST GET ENDPOINT END ===');

    return {
      message: 'Test GET endpoint working',
      received: {
        method: req.method,
        url: req.url,
        headers: req.headers
      }
    };
  }
} 
import { Injectable, UnauthorizedException, BadRequestException, ForbiddenException, NotFoundException } from '@nestjs/common';
import { DatabaseService } from '../database/database.service';
import * as bcrypt from 'bcrypt';
import { LoginRequestV2, RegisterRequestV2, AuthResponseV2 } from '@repo/shared-types';
import { Request, Response } from 'express';
import { SessionService } from '../session/session.service';
import { UserRole } from '../common/guards/roles.guard';
import { uuidv7 } from 'uuidv7';
import { Inject } from '@nestjs/common';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Cache } from 'cache-manager';
import { User } from './entities/user.entity';
import { JwtService } from './jwt.service';
import { ConfigService } from '@nestjs/config';
import { Logger } from '@nestjs/common';
import { EmailService } from '../email/email.service';
import * as crypto from 'crypto';

// Define session user type to avoid type errors
interface SessionUser {
  id: string;
  email: string;
  name: string | null;
  role: UserRole;
}

// Cookie names
const ACCESS_TOKEN_COOKIE = 'access_token';
const REFRESH_TOKEN_COOKIE = 'refresh_token';

@Injectable()
export class AuthService {
  private readonly accessTokenExpiration: number;
  private readonly refreshTokenExpiration: number;
  private readonly secureCookies: boolean;
  private readonly logger = new Logger(AuthService.name);

  constructor(
    private readonly databaseService: DatabaseService,
    private readonly sessionService: SessionService,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
    private readonly emailService: EmailService,
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
  ) {
    // Get token expiration times from config (in seconds)
    this.accessTokenExpiration = this.configService.get<number>('jwt.accessTokenExpiration') || 15 * 60; // 15 minutes
    this.refreshTokenExpiration = this.configService.get<number>('jwt.refreshTokenExpiration') || 7 * 24 * 60 * 60; // 7 days
    this.secureCookies = this.configService.get<string>('NODE_ENV') === 'production';
  }

  async validateUser(email: string, password: string): Promise<User | null> {
    this.logger.debug('[AuthService] Validating user credentials:', { email });
    
    // Try to get user from cache first
    const cacheKey = `user:email:${email}`;
    const cachedUser = await this.cacheManager.get(cacheKey);
    
    if (cachedUser) {
      this.logger.debug('[AuthService] User found in cache');
      // If user is in cache, verify password
      const user = User.fromDatabaseRow(cachedUser);
      const isPasswordValid = await bcrypt.compare(password, user.password);
      if (!isPasswordValid) {
        this.logger.debug('[AuthService] Invalid password for cached user');
        return null;
      }
      
      return user;
    }

    this.logger.debug('[AuthService] User not found in cache, querying database');
    // If not in cache, query database using transaction
    const userData = await this.databaseService.transaction(async (connection) => {
      const [rows] = await connection.query(
        'SELECT * FROM users WHERE email = ?',
        [email]
      );
      
      const users = rows as any[];
      return users.length > 0 ? users[0] : null;
    });

    if (!userData) {
      this.logger.debug('[AuthService] User not found in database');
      return null;
    }

    const user = User.fromDatabaseRow(userData);
    
    // Cache user for future requests (5 minutes TTL)
    await this.cacheManager.set(cacheKey, userData, 300000);
    this.logger.debug('[AuthService] User cached for future requests');
    
    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      this.logger.debug('[AuthService] Invalid password for database user');
      return null;
    }

    this.logger.debug('[AuthService] User validation successful');
    return user;
  }

  /**
   * Set authentication cookies on the response
   */
  private async setAuthCookies(
    res: Response,
    userId: string,
    email: string,
    role: UserRole,
  ): Promise<void> {
    // Generate tokens
    const accessToken = await this.jwtService.generateAccessToken(userId, email, role);
    const refreshToken = await this.jwtService.generateRefreshToken(userId, email, role);

    // Set access token cookie (short-lived)
    res.cookie(ACCESS_TOKEN_COOKIE, accessToken, {
      httpOnly: true,
      secure: this.secureCookies,
      sameSite: 'lax',
      maxAge: this.accessTokenExpiration * 1000, // convert to milliseconds
      path: '/api'
    });

    // Set refresh token cookie (long-lived)
    res.cookie(REFRESH_TOKEN_COOKIE, refreshToken, {
      httpOnly: true,
      secure: this.secureCookies,
      sameSite: 'lax',
      maxAge: this.refreshTokenExpiration * 1000, // convert to milliseconds
      path: '/api/auth/refresh', // Only sent to the refresh endpoint
    });
  }

  /**
   * Clear authentication cookies
   */
  private clearAuthCookies(res: Response): void {
    res.clearCookie(ACCESS_TOKEN_COOKIE, { path: '/api' });
    res.clearCookie(REFRESH_TOKEN_COOKIE, { path: '/api/auth/refresh' });
  }

  async login(req: Request, res: Response, loginData: LoginRequestV2): Promise<AuthResponseV2> {
    this.logger.debug('[AuthService] Processing login request:', { 
      email: loginData.email,
      sessionID: req.sessionID,
      hasSession: !!req.session,
      sessionData: req.session
    });

    try {
      this.logger.debug('[AuthService] Validating user credentials');
      const user = await this.validateUser(loginData.email, loginData.password);

      if (!user) {
        this.logger.error('[AuthService] Login failed: Invalid credentials for email:', loginData.email);
        throw new UnauthorizedException('Invalid credentials');
      }

      this.logger.debug('[AuthService] User validated successfully:', {
        userId: user.id,
        email: user.email,
        role: user.role
      });

      this.logger.debug('[AuthService] Setting auth cookies');
      // Set authentication cookies
      await this.setAuthCookies(res, user.id, user.email, user.role);

      this.logger.debug('[AuthService] Setting session');
      // For backward compatibility, also set the session
      const sessionUser: SessionUser = {
        id: user.id,
        email: user.email,
        name: user.name ?? null,
        role: user.role || UserRole.USER,
      };

      try {
        this.sessionService.setSession(req, user.id, sessionUser);
        this.logger.debug('[AuthService] Session set successfully:', {
          userId: user.id,
          sessionID: req.sessionID
        });
      } catch (error) {
        this.logger.error('[AuthService] Error setting session:', {
          error: error.message,
          stack: error.stack,
          sessionID: req.sessionID
        });
        // Continue even if session fails, as we have JWT cookies
      }

      this.logger.debug('[AuthService] Login successful:', { 
        userId: user.id,
        email: user.email,
        sessionID: req.sessionID,
        cookies: res.getHeader('set-cookie')
      });

      return {
        user: {
          id: user.id,
          email: user.email,
          name: user.name ?? '',
          createdAt: user.created_at instanceof Date ? user.created_at.toISOString() : user.created_at,
          updatedAt: user.updated_at instanceof Date ? user.updated_at.toISOString() : user.updated_at,
        }
      };
    } catch (error) {
      this.logger.error('[AuthService] Login process failed:', {
        email: loginData.email,
        error: error.message,
        stack: error.stack,
        type: error.constructor.name
      });
      throw error;
    }
  }

  /**
   * Generate a verification token
   */
  private generateVerificationToken(): string {
    return crypto.randomBytes(32).toString('hex');
  }

  /**
   * Send verification email to user
   */
  private async sendVerificationEmail(user: User): Promise<void> {
    // Generate a verification token
    const token = this.generateVerificationToken();
    const expires = new Date();
    expires.setHours(expires.getHours() + 24); // Token expires in 24 hours

    // Save the token to the database
    await this.databaseService.transaction(async (connection) => {
      await connection.execute(
        'UPDATE users SET verification_token = ?, verification_token_expires = ? WHERE id = ?',
        [token, expires, user.id]
      );
    });

    // Clear user cache
    await this.cacheManager.del(`user:id:${user.id}`);
    await this.cacheManager.del(`user:email:${user.email}`);

    // Send the verification email
    await this.emailService.sendVerificationEmail(user.email, token);
  }

  /**
   * Verify email with token
   */
  async verifyEmail(token: string): Promise<boolean> {
    if (!token) {
      throw new BadRequestException('Verification token is required');
    }

    // Find user with this token
    const userData = await this.databaseService.transaction(async (connection) => {
      const [rows] = await connection.query(
        'SELECT * FROM users WHERE verification_token = ? AND verification_token_expires > NOW()',
        [token]
      );
      
      const users = rows as any[];
      return users.length > 0 ? users[0] : null;
    });

    if (!userData) {
      throw new BadRequestException('Invalid or expired verification token');
    }

    // Mark email as verified and clear the token
    await this.databaseService.transaction(async (connection) => {
      await connection.execute(
        'UPDATE users SET email_verified = TRUE, verification_token = NULL, verification_token_expires = NULL WHERE id = ?',
        [userData.id]
      );
    });

    // Clear user cache
    await this.cacheManager.del(`user:id:${userData.id}`);
    await this.cacheManager.del(`user:email:${userData.email}`);

    return true;
  }

  /**
   * Resend verification email
   */
  async resendVerificationEmail(req: Request): Promise<void> {
    const userId = await this.extractUserId(req);
    if (!userId) {
      throw new UnauthorizedException('Not authenticated');
    }

    // Get current user
    const user = await this.getUserById(userId);
    if (!user) {
      throw new NotFoundException('User not found');
    }

    // Check if email is already verified
    if (user.email_verified) {
      throw new BadRequestException('Email is already verified');
    }

    // Send verification email
    await this.sendVerificationEmail(user);
  }

  /**
   * Override the register method to send verification email
   */
  async register(req: Request, res: Response, registerData: RegisterRequestV2): Promise<AuthResponseV2> {
    // Check if user already exists using transaction
    const existingUser = await this.databaseService.transaction(async (connection) => {
      const [rows] = await connection.query(
        'SELECT * FROM users WHERE email = ?',
        [registerData.email]
      );
      
      const users = rows as any[];
      return users.length > 0 ? users[0] : null;
    });

    if (existingUser) {
      throw new BadRequestException('User already exists');
    }

    // Generate UUID v7
    const userId = uuidv7();

    // Hash password
    const hashedPassword = await bcrypt.hash(registerData.password, 10);

    // Generate verification token
    const verificationToken = this.generateVerificationToken();
    const tokenExpires = new Date();
    tokenExpires.setHours(tokenExpires.getHours() + 24); // Token expires in 24 hours

    // Use transaction for user creation to ensure data consistency
    const userData = await this.databaseService.transaction(async (connection) => {
      // Create user within transaction
      await connection.execute(
        'INSERT INTO users (id, email, password, name, role, email_verified, verification_token, verification_token_expires) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
        [userId, registerData.email, hashedPassword, registerData.name || null, UserRole.USER, false, verificationToken, tokenExpires],
      );

      // Get created user within the same transaction
      const [rows] = await connection.query(
        'SELECT * FROM users WHERE id = ?',
        [userId],
      );

      const users = rows as any[];
      if (!users || users.length === 0) {
        throw new Error('Failed to create user');
      }

      return users[0];
    });

    const user = User.fromDatabaseRow(userData);

    // Cache the new user
    const cacheKey = `user:email:${registerData.email}`;
    await this.cacheManager.set(cacheKey, userData, 300000);
    
    // Cache user by ID as well
    const cacheKeyById = `user:id:${userId}`;
    await this.cacheManager.set(cacheKeyById, userData, 300000);

    // Set authentication cookies
    await this.setAuthCookies(res, user.id, user.email, user.role);

    // For backward compatibility, also set the session
    const sessionUser: SessionUser = {
      id: user.id,
      email: user.email,
      name: user.name ?? null,
      role: user.role || UserRole.USER,
    };
    this.sessionService.setSession(req, user.id, sessionUser);

    // Send verification email
    await this.emailService.sendVerificationEmail(user.email, verificationToken);

    return {
      user: {
        id: user.id,
        email: user.email,
        name: user.name ?? '',
        createdAt: user.created_at instanceof Date ? user.created_at.toISOString() : user.created_at,
        updatedAt: user.updated_at instanceof Date ? user.updated_at.toISOString() : user.updated_at,
      }
    };
  }

  /**
   * Check if user's email is verified
   */
  async isEmailVerified(userId: string): Promise<boolean> {
    const user = await this.getUserById(userId);
    if (!user) {
      throw new NotFoundException('User not found');
    }

    return user.email_verified;
  }

  /**
   * Require verified email for certain operations
   */
  async requireVerifiedEmail(userId: string): Promise<void> {
    const isVerified = await this.isEmailVerified(userId);
    if (!isVerified) {
      throw new ForbiddenException('Email verification required');
    }
  }

  async logout(req: Request, res: Response): Promise<void> {
    // Clear user cache when logging out
    if (req.session && req.session.userId) {
      const userId = req.session.userId;
      
      // Invalidate cache
      await this.cacheManager.del(`user:id:${userId}`);
      
      // Revoke all refresh tokens for the user
      await this.jwtService.revokeAllUserRefreshTokens(userId);
      
      // Clear session
      await this.sessionService.clearSession(req, res);
      
      // Clear auth cookies
      this.clearAuthCookies(res);
    } else {
      // If no session, just clear cookies
      this.clearAuthCookies(res);
    }
  }

  async refreshTokens(req: Request, res: Response): Promise<void> {
    const refreshToken = req.cookies[REFRESH_TOKEN_COOKIE];
    
    if (!refreshToken) {
      throw new UnauthorizedException('Refresh token not found');
    }
    
    // Validate the refresh token
    const validationResult = await this.jwtService.validateRefreshToken(refreshToken);
    
    if (!validationResult) {
      // Clear the invalid refresh token cookie
      res.clearCookie(REFRESH_TOKEN_COOKIE, { path: '/api/auth/refresh' });
      throw new UnauthorizedException('Invalid refresh token');
    }
    
    const { payload, tokenId } = validationResult;
    
    // Generate new tokens (rotation)
    const accessToken = await this.jwtService.generateAccessToken(
      payload.sub,
      payload.email,
      payload.role,
    );
    
    const newRefreshToken = await this.jwtService.rotateRefreshToken(
      tokenId,
      payload.sub,
      payload.email,
      payload.role,
    );
    
    // Set the new cookies
    res.cookie(ACCESS_TOKEN_COOKIE, accessToken, {
      httpOnly: true,
      secure: this.secureCookies,
      sameSite: 'lax',
      maxAge: this.accessTokenExpiration * 1000,
    });
    
    res.cookie(REFRESH_TOKEN_COOKIE, newRefreshToken, {
      httpOnly: true,
      secure: this.secureCookies,
      sameSite: 'lax',
      maxAge: this.refreshTokenExpiration * 1000,
      path: '/api/auth/refresh',
    });
    
    // Return success
    res.status(200).json({ message: 'Token refreshed successfully' });
  }

  async getProfile(req: Request): Promise<User> {
    this.logger.debug('[AuthService] Getting user profile, checking token first:', {
      sessionID: req.sessionID,
      cookies: req.cookies,
      headers: req.headers
    });

    // First try to get user ID from the access token
    const userId = await this.getUserIdFromToken(req);
    
    this.logger.debug('[AuthService] getUserIdFromToken result:', {
      userId,
      sessionID: req.sessionID
    });

    if (!userId) {
      this.logger.error('[AuthService] No valid user ID found in token or session');
      throw new UnauthorizedException('Invalid or expired token');
    }

    try {
      this.logger.debug('[AuthService] Fetching user profile from database:', { userId });
      const user = await this.getUserById(userId);
      
      if (!user) {
        this.logger.error('[AuthService] User not found in database:', { userId });
        throw new UnauthorizedException('User not found');
      }
      
      this.logger.debug('[AuthService] User profile retrieved successfully:', {
        userId: user.id,
        email: user.email
      });
      
      return user;
    } catch (error) {
      this.logger.error(`[AuthService] Error fetching user profile: ${error.message}`, {
        error: error.stack,
        userId
      });
      throw new UnauthorizedException('Authentication failed');
    }
  }

  async checkUserRole(userId: string, requiredRole: UserRole): Promise<boolean> {
    // Use transaction for role check
    const userData = await this.databaseService.transaction(async (connection) => {
      const [rows] = await connection.query(
        'SELECT * FROM users WHERE id = ?',
        [userId]
      );
      
      const users = rows as any[];
      return users.length > 0 ? users[0] : null;
    });

    if (!userData) {
      throw new UnauthorizedException('User not found');
    }

    const user = User.fromDatabaseRow(userData);
    return user.role === requiredRole;
  }

  async promoteToAdmin(userId: string, requestingUserId: string): Promise<void> {
    // Use transaction to ensure data consistency
    const targetUserEmail = await this.databaseService.transaction(async (connection) => {
      // Check if requesting user is an admin within transaction
      const [adminRows] = await connection.query(
        'SELECT role FROM users WHERE id = ?',
        [requestingUserId],
      );

      const adminUsers = adminRows as any[];
      if (!adminUsers || adminUsers.length === 0) {
        throw new UnauthorizedException('User not found');
      }

      const adminUser = User.fromDatabaseRow(adminUsers[0]);
      if (adminUser.role !== UserRole.ADMIN) {
        throw new ForbiddenException('Only admins can promote users');
      }

      // Check if target user exists
      const [targetRows] = await connection.query(
        'SELECT id, email FROM users WHERE id = ?',
        [userId],
      );

      const targetUsers = targetRows as any[];
      if (!targetUsers || targetUsers.length === 0) {
        throw new NotFoundException('Target user not found');
      }

      // Update user role to admin within transaction
      await connection.execute(
        'UPDATE users SET role = ? WHERE id = ?',
        [UserRole.ADMIN, userId],
      );

      return targetUsers[0].email;
    });
    
    // Invalidate cache for the promoted user
    await this.cacheManager.del(`user:id:${userId}`);
    
    // Also invalidate email-based cache if we have it
    if (targetUserEmail) {
      await this.cacheManager.del(`user:email:${targetUserEmail}`);
    }
  }

  /**
   * Extract user ID from request (token or session)
   */
  public async extractUserId(req: Request): Promise<string | null> {
    // First try to get user ID from the access token
    const accessToken = req.cookies[ACCESS_TOKEN_COOKIE];
    
    if (accessToken) {
      try {
        const payload = await this.jwtService.validateAccessToken(accessToken);
        if (payload) {
          return payload.sub;
        }
      } catch (error) {
        this.logger.debug(`Invalid access token: ${error.message}`);
        // Continue to try session-based auth
      }
    }
    
    // If no valid access token, fall back to session
    if (req.session && req.session.userId) {
      return req.session.userId;
    }
    
    return null;
  }

  /**
   * Get user ID from access token or session
   */
  private async getUserIdFromToken(req: Request): Promise<string | null> {
    const accessToken = req.cookies[ACCESS_TOKEN_COOKIE];
    let userId: string | null = null;
    
    this.logger.debug('[AuthService] Getting user ID from token:', {
      hasAccessToken: !!accessToken,
      sessionID: req.sessionID,
      cookies: req.cookies
    });
    
    if (accessToken) {
      try {
        this.logger.debug('[AuthService] Validating access token');
        const payload = await this.jwtService.validateAccessToken(accessToken);
        
        if (payload) {
          userId = payload.sub;
          this.logger.debug('[AuthService] Valid access token found:', {
            userId,
            email: payload.email
          });
        }
      } catch (error) {
        this.logger.debug('[AuthService] Invalid access token:', {
          error: error.message,
          stack: error.stack
        });
        // Continue to try session-based auth
      }
    }
    
    // If no valid access token, fall back to session
    if (!userId && req.session && req.session.userId) {
      userId = req.session.userId;
      this.logger.debug('[AuthService] Using session-based auth:', {
        userId,
        sessionID: req.sessionID
      });
    }
    
    if (!userId) {
      this.logger.debug('[AuthService] No valid user ID found in token or session');
    }
    
    return userId;
  }

  /**
   * Get user by ID
   */
  private async getUserById(userId: string): Promise<User | null> {
    try {
      // Try to get user from cache first
      const cacheKey = `user:id:${userId}`;
      const cachedUser = await this.cacheManager.get(cacheKey);
      
      if (cachedUser) {
        return User.fromDatabaseRow(cachedUser);
      }

      // If not in cache, query database using transaction
      const userData = await this.databaseService.transaction(async (connection) => {
        const [rows] = await connection.query(
          'SELECT * FROM users WHERE id = ?',
          [userId]
        );
        
        const users = rows as any[];
        return users.length > 0 ? users[0] : null;
      });

      if (!userData) {
        return null;
      }

      const user = User.fromDatabaseRow(userData);
      
      // Cache user for future requests (5 minutes TTL)
      await this.cacheManager.set(cacheKey, userData, 300000);

      return user;
    } catch (error) {
      this.logger.error(`Error fetching user by ID: ${error.message}`, error.stack);
      return null;
    }
  }

  /**
   * Update user profile
   */
  async updateProfile(req: Request, updateData: { name?: string; email?: string }): Promise<User> {
    const userId = await this.extractUserId(req);
    if (!userId) {
      throw new UnauthorizedException('Not authenticated');
    }

    // Get current user
    const currentUser = await this.getUserById(userId);
    if (!currentUser) {
      throw new NotFoundException('User not found');
    }

    // Check if email is being updated
    if (updateData.email && updateData.email !== currentUser.email) {
      // Check if new email is already taken
      const existingUser = await this.databaseService.transaction(async (connection) => {
        const [rows] = await connection.query(
          'SELECT * FROM users WHERE email = ? AND id != ?',
          [updateData.email, userId]
        );
        return (rows as any[]).length > 0;
      });

      if (existingUser) {
        throw new BadRequestException('Email is already taken');
      }
    }

    // Update user
    const updatedUser = await this.databaseService.transaction(async (connection) => {
      const updates: string[] = [];
      const values: any[] = [];

      if (updateData.name !== undefined) {
        updates.push('name = ?');
        values.push(updateData.name);
      }

      if (updateData.email !== undefined) {
        updates.push('email = ?');
        values.push(updateData.email);
      }

      if (updates.length === 0) {
        return currentUser;
      }

      values.push(userId);

      await connection.execute(
        `UPDATE users SET ${updates.join(', ')} WHERE id = ?`,
        values
      );

      // Get updated user
      const [rows] = await connection.query(
        'SELECT * FROM users WHERE id = ?',
        [userId]
      );
      
      const users = rows as any[];
      return users.length > 0 ? User.fromDatabaseRow(users[0]) : null;
    });

    if (!updatedUser) {
      throw new NotFoundException('User not found after update');
    }

    // Update cache
    await this.cacheManager.del(`user:id:${userId}`);
    if (updateData.email && updateData.email !== currentUser.email) {
      await this.cacheManager.del(`user:email:${currentUser.email}`);
      await this.cacheManager.set(`user:email:${updateData.email}`, updatedUser, 300000);
    }

    return updatedUser;
  }

  /**
   * Change user password
   */
  async changePassword(req: Request, changeData: { currentPassword: string; newPassword: string }): Promise<void> {
    const userId = await this.extractUserId(req);
    if (!userId) {
      throw new UnauthorizedException('Not authenticated');
    }

    // Get current user
    const user = await this.getUserById(userId);
    if (!user) {
      throw new NotFoundException('User not found');
    }

    // Verify current password
    const isPasswordValid = await bcrypt.compare(changeData.currentPassword, user.password);
    if (!isPasswordValid) {
      throw new BadRequestException('Current password is incorrect');
    }

    // Hash new password
    const hashedPassword = await bcrypt.hash(changeData.newPassword, 10);

    // Update password
    await this.databaseService.transaction(async (connection) => {
      await connection.execute(
        'UPDATE users SET password = ? WHERE id = ?',
        [hashedPassword, userId]
      );
    });

    // Invalidate all refresh tokens for this user for security
    await this.jwtService.revokeAllUserRefreshTokens(userId);

    // Clear cache
    await this.cacheManager.del(`user:id:${userId}`);
    await this.cacheManager.del(`user:email:${user.email}`);
  }

  /**
   * Delete user account
   */
  async deleteAccount(req: Request, res: Response, deleteData: { password: string }): Promise<void> {
    const userId = await this.extractUserId(req);
    if (!userId) {
      throw new UnauthorizedException('Not authenticated');
    }

    // Get current user
    const user = await this.getUserById(userId);
    if (!user) {
      throw new NotFoundException('User not found');
    }

    // Verify password
    const isPasswordValid = await bcrypt.compare(deleteData.password, user.password);
    if (!isPasswordValid) {
      throw new BadRequestException('Password is incorrect');
    }

    // Delete user and all related data
    await this.databaseService.transaction(async (connection) => {
      // Delete refresh tokens first (foreign key constraint)
      await connection.execute(
        'DELETE FROM refresh_tokens WHERE user_id = ?',
        [userId]
      );

      // Delete user
      await connection.execute(
        'DELETE FROM users WHERE id = ?',
        [userId]
      );
    });

    // Logout user
    await this.logout(req, res);

    // Clear cache
    await this.cacheManager.del(`user:id:${userId}`);
    await this.cacheManager.del(`user:email:${user.email}`);
  }
}
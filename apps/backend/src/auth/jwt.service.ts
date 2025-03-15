import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService as NestJwtService } from '@nestjs/jwt';
import { DatabaseService } from '../database/database.service';
import { uuidv7 } from 'uuidv7';
import { UserRole } from '../common/guards/roles.guard';

interface TokenPayload {
  sub: string;
  email: string;
  role: UserRole;
  type: 'access' | 'refresh';
}

@Injectable()
export class JwtService {
  private readonly logger = new Logger(JwtService.name);
  private readonly accessTokenExpiration: number;
  private readonly refreshTokenExpiration: number;

  constructor(
    private readonly jwtService: NestJwtService,
    private readonly configService: ConfigService,
    private readonly databaseService: DatabaseService,
  ) {
    // Get token expiration times from config (in seconds)
    this.accessTokenExpiration = this.configService.get<number>('jwt.accessTokenExpiration') || 15 * 60; // 15 minutes
    this.refreshTokenExpiration = this.configService.get<number>('jwt.refreshTokenExpiration') || 7 * 24 * 60 * 60; // 7 days
  }

  /**
   * Generate an access token for a user
   */
  async generateAccessToken(userId: string, email: string, role: UserRole): Promise<string> {
    const payload: TokenPayload = {
      sub: userId,
      email,
      role,
      type: 'access',
    };

    return this.jwtService.signAsync(payload, {
      expiresIn: this.accessTokenExpiration,
    });
  }

  /**
   * Generate a refresh token for a user and store it in the database
   */
  async generateRefreshToken(userId: string, email: string, role: UserRole): Promise<string> {
    const payload: TokenPayload = {
      sub: userId,
      email,
      role,
      type: 'refresh',
    };

    const token = await this.jwtService.signAsync(payload, {
      expiresIn: this.refreshTokenExpiration,
    });

    // Store the refresh token in the database
    const tokenId = uuidv7();
    const expiresAt = new Date(Date.now() + this.refreshTokenExpiration * 1000);

    await this.databaseService.transaction(async (connection) => {
      await connection.execute(
        'INSERT INTO refresh_tokens (id, user_id, token, expires_at) VALUES (?, ?, ?, ?)',
        [tokenId, userId, token, expiresAt],
      );
    });

    return token;
  }

  /**
   * Validate an access token
   */
  async validateAccessToken(token: string): Promise<TokenPayload | null> {
    try {
      const payload = await this.jwtService.verifyAsync<TokenPayload>(token);
      
      if (payload.type !== 'access') {
        this.logger.warn('Token type mismatch: expected access token');
        return null;
      }
      
      return payload;
    } catch (error) {
      this.logger.warn('Access token validation failed:', error.message);
      return null;
    }
  }

  /**
   * Validate a refresh token
   */
  async validateRefreshToken(token: string): Promise<{ payload: TokenPayload; tokenId: string } | null> {
    try {
      const payload = await this.jwtService.verifyAsync<TokenPayload>(token);
      
      if (payload.type !== 'refresh') {
        this.logger.warn('Token type mismatch: expected refresh token');
        return null;
      }
      
      // Check if the token exists in the database and is not revoked
      const tokenData = await this.databaseService.transaction(async (connection) => {
        const [rows] = await connection.query(
          'SELECT id FROM refresh_tokens WHERE token = ? AND revoked = FALSE AND expires_at > NOW()',
          [token],
        );
        
        const tokens = rows as any[];
        return tokens.length > 0 ? tokens[0] : null;
      });
      
      if (!tokenData) {
        this.logger.warn('Refresh token not found in database or revoked');
        return null;
      }
      
      return { payload, tokenId: tokenData.id };
    } catch (error) {
      this.logger.warn('Refresh token validation failed:', error.message);
      return null;
    }
  }

  /**
   * Revoke a refresh token
   */
  async revokeRefreshToken(tokenId: string): Promise<void> {
    await this.databaseService.transaction(async (connection) => {
      await connection.execute(
        'UPDATE refresh_tokens SET revoked = TRUE WHERE id = ?',
        [tokenId],
      );
    });
  }

  /**
   * Revoke all refresh tokens for a user
   */
  async revokeAllUserRefreshTokens(userId: string): Promise<void> {
    await this.databaseService.transaction(async (connection) => {
      await connection.execute(
        'UPDATE refresh_tokens SET revoked = TRUE WHERE user_id = ?',
        [userId],
      );
    });
  }

  /**
   * Rotate a refresh token (revoke the old one and generate a new one)
   */
  async rotateRefreshToken(
    oldTokenId: string,
    userId: string,
    email: string,
    role: UserRole,
  ): Promise<string> {
    const newToken = await this.generateRefreshToken(userId, email, role);
    
    // Mark the old token as replaced
    await this.databaseService.transaction(async (connection) => {
      await connection.execute(
        'UPDATE refresh_tokens SET revoked = TRUE, replaced_by = ? WHERE id = ?',
        [newToken, oldTokenId],
      );
    });
    
    return newToken;
  }

  /**
   * Clean up expired tokens
   */
  async cleanupExpiredTokens(): Promise<void> {
    await this.databaseService.transaction(async (connection) => {
      await connection.execute(
        'DELETE FROM refresh_tokens WHERE expires_at < NOW()',
      );
    });
  }
} 
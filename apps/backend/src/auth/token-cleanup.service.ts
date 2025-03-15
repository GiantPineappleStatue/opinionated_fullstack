import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { JwtService } from './jwt.service';

@Injectable()
export class TokenCleanupService {
  private readonly logger = new Logger(TokenCleanupService.name);

  constructor(private readonly jwtService: JwtService) {}

  /**
   * Clean up expired tokens daily at midnight
   */
  @Cron(CronExpression.EVERY_DAY_AT_MIDNIGHT)
  async cleanupExpiredTokens() {
    this.logger.log('Starting cleanup of expired refresh tokens');
    
    try {
      await this.jwtService.cleanupExpiredTokens();
      this.logger.log('Expired refresh tokens cleanup completed successfully');
    } catch (error) {
      this.logger.error('Error cleaning up expired refresh tokens:', error.stack);
    }
  }
} 
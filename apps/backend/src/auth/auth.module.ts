import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { DatabaseModule } from '../database/database.module';
import { SessionModule } from '../session/session.module';
import { JwtService } from './jwt.service';
import { TokenCleanupService } from './token-cleanup.service';
import { EmailModule } from '../email/email.module';
import { AdminController } from './admin.controller';

@Module({
  imports: [
    ConfigModule,
    DatabaseModule,
    SessionModule,
    EmailModule,
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        secret: configService.get<string>('jwt.secret') || 'super-secret-key-change-in-production',
        signOptions: {
          expiresIn: configService.get<string>('jwt.expiresIn') || '15m',
        },
      }),
    }),
  ],
  controllers: [AuthController, AdminController],
  providers: [AuthService, JwtService, TokenCleanupService],
  exports: [AuthService, JwtService],
})
export class AuthModule {} 
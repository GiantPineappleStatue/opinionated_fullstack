import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AppConfigModule } from './config/config.module';
import { ThrottlerModule } from '@nestjs/throttler';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { ScheduleModule } from '@nestjs/schedule';
import { DatabaseModule } from './database/database.module';
import { RedisModule } from './redis/redis.module';
import { SessionModule } from './session/session.module';
import { AuthModule } from './auth/auth.module';
import { CommonModule } from './common/common.module';
import { RabbitMQModule } from './rabbitmq/rabbitmq.module';
import { NatsModule } from './nats/nats.module';
import { TasksModule } from './tasks/tasks.module';
import { APP_GUARD } from '@nestjs/core';
import { AuthGuard } from './common/guards/auth.guard';
import { RolesGuard } from './common/guards/roles.guard';
import { AdminModule } from './admin/admin.module';
import { OpenAIModule } from './openai/openai.module';
import { EmailModule } from './email/email.module';
import { CacheModule } from './cache/cache.module';

@Module({
  imports: [
    // Configuration
    AppConfigModule,
    
    // Database
    DatabaseModule,
    
    // Redis and Session
    RedisModule,
    SessionModule,
    
    // Message Queue and Streaming
    RabbitMQModule,
    NatsModule,
    TasksModule,
    
    // Common (filters, guards, etc.)
    CommonModule,
    
    // Auth
    AuthModule,
    
    // Email
    EmailModule,
    
    // Rate limiting
    ThrottlerModule.forRoot([{
      ttl: 60,
      limit: 10,
    }]),
    
    // Caching
    CacheModule,
    
    // Scheduling
    ScheduleModule.forRoot(),
    
    // Admin
    AdminModule,
    
    // OpenAI
    OpenAIModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    {
      provide: APP_GUARD,
      useClass: AuthGuard,
    },
    {
      provide: APP_GUARD,
      useClass: RolesGuard,
    },
  ],
})
export class AppModule {}

import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { NatsService } from './nats.service';
import { NatsController } from './nats.controller';

@Module({
  imports: [ConfigModule],
  providers: [NatsService],
  controllers: [NatsController],
  exports: [NatsService],
})
export class NatsModule {} 
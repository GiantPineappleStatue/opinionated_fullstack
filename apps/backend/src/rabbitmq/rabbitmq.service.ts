import { Injectable, Logger, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class RabbitMQService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(RabbitMQService.name);
  private enabled = false;

  constructor(private configService: ConfigService) {
    // Check if RabbitMQ is enabled
    this.enabled = this.configService.get<string>('rabbitmq.enabled') === 'true';
  }

  async onModuleInit() {
    this.logger.log('RabbitMQ is disabled. Using mock implementation.');
  }

  async onModuleDestroy() {
    // Nothing to clean up
  }

  async sendMessage(queue: string, message: any): Promise<boolean> {
    this.logger.warn(`[MOCK] Message to ${queue} not sent: ${JSON.stringify(message)}`);
    return true; // Pretend it worked
  }

  async consumeMessages(
    queue: string,
    callback: (message: any) => Promise<void>
  ): Promise<void> {
    this.logger.warn(`[MOCK] Not consuming messages from ${queue}`);
    // No-op
  }
} 
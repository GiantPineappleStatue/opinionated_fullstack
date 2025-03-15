import { Injectable, Logger, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as nats from 'nats';

// Mock NATS subscription for when NATS is disabled
class MockNatsSubscription {
  private logger = new Logger('MockNatsSubscription');
  private subject: string;

  constructor(subject: string) {
    this.subject = subject;
    this.logger.log(`[MOCK] Created subscription for ${subject}`);
  }

  unsubscribe(): void {
    this.logger.debug(`[MOCK] Unsubscribed from ${this.subject}`);
  }
}

@Injectable()
export class NatsService implements OnModuleInit, OnModuleDestroy {
  private client: nats.NatsConnection | null = null;
  private readonly logger = new Logger(NatsService.name);
  private enabled = true;

  constructor(private configService: ConfigService) {
    this.enabled = this.configService.get<boolean>('nats.enabled') !== false;
  }

  async onModuleInit() {
    if (!this.enabled) {
      this.logger.log('NATS is disabled. Using mock implementation.');
      return;
    }

    try {
      const url = this.configService.get<string>('nats.url') || 'nats://localhost:4222';
      this.logger.log(`Connecting to NATS at ${url}`);
      
      this.client = await nats.connect({ servers: url });
      
      this.logger.log('NATS connection established');
    } catch (error) {
      this.logger.error('Failed to connect to NATS', error.stack);
      // Don't throw error, just log it
      this.client = null;
    }
  }

  async onModuleDestroy() {
    try {
      if (this.client) {
        await this.client.close();
        this.logger.log('NATS connection closed');
      }
    } catch (error) {
      this.logger.error('Error closing NATS connection', error.stack);
    }
  }

  async publish(subject: string, data: any): Promise<void> {
    if (!this.enabled || !this.client) {
      this.logger.debug(`[MOCK] Published message to ${subject}: ${JSON.stringify(data)}`);
      return;
    }

    try {
      const payload = JSON.stringify(data);
      this.client.publish(subject, nats.StringCodec().encode(payload));
      this.logger.debug(`Published message to ${subject}`);
    } catch (error) {
      this.logger.error(`Error publishing message to ${subject}`, error.stack);
      // Don't throw error, just log it
    }
  }

  async subscribe(subject: string, callback: (data: any) => Promise<void>): Promise<nats.Subscription | MockNatsSubscription> {
    if (!this.enabled || !this.client) {
      this.logger.debug(`[MOCK] Subscribed to ${subject}`);
      return new MockNatsSubscription(subject);
    }

    try {
      const subscription = this.client.subscribe(subject);
      
      // Process messages
      (async () => {
        for await (const msg of subscription) {
          try {
            const data = JSON.parse(nats.StringCodec().decode(msg.data));
            await callback(data);
          } catch (error) {
            this.logger.error(`Error processing message from ${subject}`, error.stack);
          }
        }
      })().catch((error) => {
        this.logger.error(`Subscription error for ${subject}`, error.stack);
      });
      
      this.logger.log(`Subscribed to ${subject}`);
      return subscription;
    } catch (error) {
      this.logger.error(`Error subscribing to ${subject}`, error.stack);
      // Return a mock subscription instead of throwing
      return new MockNatsSubscription(subject);
    }
  }

  async unsubscribe(subscription: nats.Subscription | MockNatsSubscription): Promise<void> {
    try {
      subscription.unsubscribe();
      this.logger.log('Unsubscribed from subscription');
    } catch (error) {
      this.logger.error('Error unsubscribing', error.stack);
      // Don't throw error, just log it
    }
  }
} 
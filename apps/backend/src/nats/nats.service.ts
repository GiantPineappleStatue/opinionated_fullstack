import { Injectable, Logger, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { connect, NatsConnection, Subscription, StringCodec } from 'nats';

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
  private client: NatsConnection | null = null;
  private readonly logger = new Logger(NatsService.name);
  private readonly isProduction: boolean;
  private readonly maxRetries = 5;
  private retryCount = 0;
  private readonly subscriptions = new Set<Subscription>();
  private readonly stringCodec = StringCodec();

  constructor(private configService: ConfigService) {
    this.isProduction = this.configService.get<string>('NODE_ENV') === 'production';
  }

  async onModuleInit() {
    await this.connect();

    // Set up test response handler
    if (this.client) {
      try {
        const subscription = await this.subscribe('test.response', async (data) => {
          this.logger.log(`Received test response from Python: ${JSON.stringify(data)}`);
        });
        this.logger.log('Subscribed to test.response');
      } catch (error) {
        this.logger.error('Failed to subscribe to test.response:', error);
      }
    }
  }

  private async connect() {
    try {
      const url = this.configService.get<string>('nats.url') || 'nats://localhost:4222';
      this.logger.log(`Connecting to NATS at ${url}`);
      
      this.client = await connect({
        servers: url,
        reconnect: true,
        maxReconnectAttempts: this.maxRetries,
        reconnectTimeWait: 5000,
        timeout: 10000,
        user: this.configService.get<string>('nats.username'),
        pass: this.configService.get<string>('nats.password'),
      });
      
      // Handle connection events
      if (this.client) {
        (async () => {
          for await (const status of this.client!.status()) {
            const data = status.data ? JSON.stringify(status.data) : '';
            switch (status.type) {
              case 'disconnect':
                this.logger.warn(`NATS client disconnected: ${data}`);
                break;
              case 'reconnect':
                this.logger.log(`NATS client reconnected: ${data}`);
                await this.resubscribeAll();
                break;
              case 'error':
                this.logger.error(`NATS client error: ${data}`);
                if (this.isProduction) {
                  await this.handleConnectionError(new Error(data));
                }
                break;
              default:
                this.logger.debug(`NATS client status: ${status.type} ${data}`);
            }
          }
        })().catch((error) => {
          this.logger.error('Error handling NATS status:', error);
        });
      }

      this.logger.log('NATS connection established');
      this.retryCount = 0;
    } catch (error) {
      this.logger.error('Failed to connect to NATS:', error.stack);
      await this.handleConnectionError(error);
    }
  }

  private async handleConnectionError(error: Error) {
    if (this.isProduction) {
      if (this.retryCount < this.maxRetries) {
        this.retryCount++;
        this.logger.warn(`Retrying NATS connection (attempt ${this.retryCount}/${this.maxRetries})`);
        await new Promise(resolve => setTimeout(resolve, 5000));
        await this.connect();
      } else {
        this.logger.error('Max NATS connection retries reached. Exiting application.');
        process.exit(1);
      }
    }
  }

  private async resubscribeAll() {
    // Clear old subscriptions
    for (const sub of this.subscriptions) {
      try {
        await sub.unsubscribe();
      } catch (error) {
        this.logger.error('Error unsubscribing:', error);
      }
    }
    this.subscriptions.clear();
  }

  async onModuleDestroy() {
    if (this.client) {
      // Unsubscribe from all subscriptions
      for (const sub of this.subscriptions) {
        try {
          await sub.unsubscribe();
        } catch (error) {
          this.logger.error('Error unsubscribing during shutdown:', error);
        }
      }
      
      // Drain and close the connection
      try {
        await this.client.drain();
        await this.client.close();
        this.logger.log('NATS connection closed');
      } catch (error) {
        this.logger.error('Error closing NATS connection:', error);
      }
    }
  }

  async publish(subject: string, data: any): Promise<void> {
    if (!this.client) {
      throw new Error('NATS client not initialized');
    }

    try {
      const payload = JSON.stringify(data);
      this.client.publish(subject, this.stringCodec.encode(payload));
      this.logger.debug(`Published message to ${subject}`);
    } catch (error) {
      this.logger.error(`Error publishing message to ${subject}:`, error);
      throw error;
    }
  }

  async subscribe(subject: string, callback: (data: any) => Promise<void>): Promise<Subscription> {
    if (!this.client) {
      throw new Error('NATS client not initialized');
    }

    try {
      const subscription = this.client.subscribe(subject, {
        callback: async (err, msg) => {
          if (err) {
            this.logger.error(`Subscription error for ${subject}:`, err);
            return;
          }
          try {
            const data = JSON.parse(this.stringCodec.decode(msg.data));
            await callback(data);
          } catch (error) {
            this.logger.error(`Error processing message from ${subject}:`, error);
          }
        }
      });

      this.subscriptions.add(subscription);
      this.logger.log(`Subscribed to ${subject}`);
      return subscription;
    } catch (error) {
      this.logger.error(`Error subscribing to ${subject}:`, error);
      throw error;
    }
  }

  async unsubscribe(subscription: Subscription | MockNatsSubscription): Promise<void> {
    try {
      subscription.unsubscribe();
      this.logger.log('Unsubscribed from subscription');
    } catch (error) {
      this.logger.error('Error unsubscribing', error.stack);
      // Don't throw error, just log it
    }
  }
} 
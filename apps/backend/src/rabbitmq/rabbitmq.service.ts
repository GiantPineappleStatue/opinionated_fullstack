import { Injectable, Logger, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Channel, ChannelModel, connect } from 'amqplib';
import { promisify } from 'util';

@Injectable()
export class RabbitMQService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(RabbitMQService.name);
  private connection: ChannelModel | null = null;
  private channel: Channel | null = null;
  private readonly isProduction: boolean;
  private readonly maxRetries = 5;
  private retryCount = 0;
  private readonly queues = new Set<string>();

  constructor(private configService: ConfigService) {
    this.isProduction = this.configService.get<string>('NODE_ENV') === 'production';
  }

  async onModuleInit() {
    await this.connect();
  }

  private async connect() {
    try {
      const host = this.configService.get<string>('RABBITMQ_HOST') || 'localhost';
      const port = this.configService.get<string>('RABBITMQ_PORT') || '5672';
      const user = this.configService.get<string>('RABBITMQ_USER') || 'guest';
      const password = this.configService.get<string>('RABBITMQ_PASSWORD') || 'guest';
      const url = `amqp://${user}:${password}@${host}:${port}/`;
      
      this.logger.log(`Connecting to RabbitMQ at ${host}:${port}`);
      this.connection = await connect(url);
      
      this.connection.on('error', (error) => {
        this.logger.error('RabbitMQ connection error:', error);
        if (this.isProduction) {
          this.handleConnectionError(error);
        }
      });

      this.connection.on('close', () => {
        this.logger.warn('RabbitMQ connection closed');
        if (this.isProduction) {
          this.handleConnectionError(new Error('Connection closed'));
        }
      });

      const ch = await this.connection.createChannel();
      this.channel = ch;
      
      // Configure channel
      await ch.prefetch(1);
      
      ch.on('error', (error) => {
        this.logger.error('RabbitMQ channel error:', error);
        this.createChannel();
      });

      ch.on('close', () => {
        this.logger.warn('RabbitMQ channel closed');
        this.createChannel();
      });

      this.logger.log('RabbitMQ connection established');
      this.retryCount = 0;
    } catch (error) {
      this.logger.error('Failed to connect to RabbitMQ:', error instanceof Error ? error.stack : error);
      await this.handleConnectionError(error instanceof Error ? error : new Error(String(error)));
    }
  }

  private async createChannel() {
    try {
      if (this.connection) {
        const ch = await this.connection.createChannel();
        this.channel = ch;
        await ch.prefetch(1);
        
        // Re-declare queues and re-establish consumers
        for (const queue of this.queues) {
          await ch.assertQueue(queue, { durable: true });
        }
        
        this.logger.log('RabbitMQ channel recreated');
      }
    } catch (error) {
      this.logger.error('Failed to create RabbitMQ channel:', error);
      if (this.isProduction) {
        await this.handleConnectionError(error instanceof Error ? error : new Error(String(error)));
      }
    }
  }

  private async handleConnectionError(error: Error) {
    if (this.isProduction) {
      if (this.retryCount < this.maxRetries) {
        this.retryCount++;
        this.logger.warn(`Retrying RabbitMQ connection (attempt ${this.retryCount}/${this.maxRetries})`);
        await new Promise(resolve => setTimeout(resolve, 5000));
        await this.connect();
      } else {
        this.logger.error('Max RabbitMQ connection retries reached. Exiting application.');
        process.exit(1);
      }
    }
  }

  async onModuleDestroy() {
    try {
      if (this.channel) {
        await this.channel.close();
      }
      if (this.connection) {
        await this.connection.close();
        this.logger.log('RabbitMQ connection closed');
      }
    } catch (error) {
      this.logger.error('Error closing RabbitMQ connections:', error);
    }
  }

  async sendMessage(queue: string, message: any): Promise<boolean> {
    if (!this.channel) {
      throw new Error('RabbitMQ channel not initialized');
    }

    try {
      // Ensure queue exists
      await this.channel.assertQueue(queue, { durable: true });
      this.queues.add(queue);

      // Send message
      const buffer = Buffer.from(JSON.stringify(message));
      return this.channel.sendToQueue(queue, buffer, {
        persistent: true,
        contentType: 'application/json',
      });
    } catch (error) {
      this.logger.error(`Error sending message to queue ${queue}:`, error);
      throw error;
    }
  }

  async consumeMessages(
    queue: string,
    callback: (message: any) => Promise<void>
  ): Promise<void> {
    if (!this.channel) {
      throw new Error('RabbitMQ channel not initialized');
    }

    try {
      // Ensure queue exists
      await this.channel.assertQueue(queue, { durable: true });
      this.queues.add(queue);

      // Start consuming
      await this.channel.consume(queue, async (msg) => {
        if (msg) {
          try {
            const content = JSON.parse(msg.content.toString());
            await callback(content);
            this.channel?.ack(msg);
          } catch (error) {
            this.logger.error(`Error processing message from queue ${queue}:`, error);
            // Reject the message and requeue it
            this.channel?.nack(msg, false, true);
          }
        }
      });

      this.logger.log(`Started consuming messages from queue: ${queue}`);
    } catch (error) {
      this.logger.error(`Error setting up consumer for queue ${queue}:`, error);
      throw error;
    }
  }
} 
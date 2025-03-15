import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { RabbitMQService } from '../rabbitmq/rabbitmq.service';
import { NatsService } from '../nats/nats.service';
import { Task, TaskStatus } from './tasks.schema';

@Injectable()
export class TasksService implements OnModuleInit {
  private readonly logger = new Logger(TasksService.name);
  private readonly queueName: string;

  constructor(
    private readonly configService: ConfigService,
    private readonly rabbitMQService: RabbitMQService,
    private readonly natsService: NatsService,
  ) {
    this.queueName = this.configService.get<string>('rabbitmq.queue') || 'tasks';
  }

  async onModuleInit() {
    // Start consuming messages from the queue
    await this.setupTaskConsumer();
  }

  async setupTaskConsumer() {
    try {
      await this.rabbitMQService.consumeMessages(
        this.queueName,
        async (message: Task) => {
          await this.processTask(message);
        }
      );
      this.logger.log(`Started consuming tasks from queue: ${this.queueName}`);
    } catch (error) {
      this.logger.error('Failed to setup task consumer', error.stack);
    }
  }

  async queueTask(taskData: Task): Promise<boolean> {
    try {
      const success = await this.rabbitMQService.sendMessage(
        this.queueName,
        taskData
      );
      
      if (success) {
        this.logger.log(`Task queued successfully: ${taskData.id}`);
        
        // Publish task queued event to NATS
        await this.natsService.publish('task.queued', {
          id: taskData.id,
          type: taskData.type,
          status: 'queued' as TaskStatus,
          timestamp: new Date().toISOString(),
        });
      } else {
        this.logger.warn(`Failed to queue task: ${taskData.id}`);
      }
      
      return success;
    } catch (error) {
      this.logger.error(`Error queueing task: ${taskData.id}`, error.stack);
      throw error;
    }
  }

  private async processTask(taskData: Task): Promise<void> {
    this.logger.log(`Processing task: ${taskData.id}, type: ${taskData.type}`);
    
    try {
      // Publish task processing event
      await this.natsService.publish('task.processing', {
        id: taskData.id,
        type: taskData.type,
        status: 'processing' as TaskStatus,
        timestamp: new Date().toISOString(),
      });
      
      // Process different task types
      switch (taskData.type) {
        case 'email':
          await this.processEmailTask(taskData.payload);
          break;
        case 'notification':
          await this.processNotificationTask(taskData.payload);
          break;
        case 'data-processing':
          await this.processDataTask(taskData.payload);
          break;
        default:
          this.logger.warn(`Unknown task type: ${taskData.type}`);
      }
      
      // Publish task completion event
      await this.natsService.publish('task.completed', {
        id: taskData.id,
        type: taskData.type,
        status: 'completed' as TaskStatus,
        timestamp: new Date().toISOString(),
      });
      
      this.logger.log(`Task completed: ${taskData.id}`);
    } catch (error) {
      this.logger.error(`Error processing task: ${taskData.id}`, error.stack);
      
      // Publish task failure event
      await this.natsService.publish('task.failed', {
        id: taskData.id,
        type: taskData.type,
        status: 'failed' as TaskStatus,
        error: error.message,
        timestamp: new Date().toISOString(),
      });
    }
  }

  private async processEmailTask(payload: any): Promise<void> {
    // Simulate email sending
    this.logger.log(`Sending email to: ${payload.recipient}`);
    await new Promise(resolve => setTimeout(resolve, 500));
  }

  private async processNotificationTask(payload: any): Promise<void> {
    // Simulate notification sending
    this.logger.log(`Sending notification: ${payload.message}`);
    await new Promise(resolve => setTimeout(resolve, 300));
  }

  private async processDataTask(payload: any): Promise<void> {
    // Simulate data processing
    this.logger.log(`Processing data for: ${payload.userId}`);
    await new Promise(resolve => setTimeout(resolve, 1000));
  }
} 
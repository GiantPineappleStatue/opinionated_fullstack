# Tasks Module

This module provides asynchronous task processing capabilities using RabbitMQ for message queuing and NATS for real-time event streaming.

## Features

- Queue different types of tasks (email, notification, data processing)
- Process tasks asynchronously
- Real-time task status updates via NATS
- Validation using Zod schemas
- Error handling and logging

## Architecture

The Tasks module follows a producer-consumer pattern:

1. **Producer**: The TasksController receives task requests, validates them using Zod schemas, and queues them in RabbitMQ via the TasksService.
2. **Queue**: RabbitMQ stores the tasks until they are processed.
3. **Consumer**: The TasksService consumes tasks from RabbitMQ and processes them.
4. **Event Stream**: NATS is used to publish real-time status updates for tasks.

## Usage

### Importing the Module

```typescript
import { TasksModule } from './tasks/tasks.module';

@Module({
  imports: [
    // ... other modules
    TasksModule,
  ],
})
export class AppModule {}
```

### Injecting the TasksService

```typescript
import { Injectable } from '@nestjs/common';
import { TasksService } from './tasks/tasks.service';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class YourService {
  constructor(private readonly tasksService: TasksService) {}

  async someMethod() {
    // Queue a task
    await this.tasksService.queueTask({
      id: uuidv4(),
      type: 'email',
      payload: {
        recipient: 'user@example.com',
        subject: 'Hello',
        body: 'This is a test email',
      },
      createdAt: new Date(),
    });
  }
}
```

## API Endpoints

### Queue a Generic Task

```
POST /tasks
```

Request body:
```json
{
  "type": "email",
  "payload": {
    "recipient": "user@example.com",
    "subject": "Hello",
    "body": "This is a test email"
  }
}
```

Response:
```json
{
  "success": true,
  "taskId": "123e4567-e89b-12d3-a456-426614174000",
  "message": "Task queued successfully"
}
```

### Queue an Email Task

```
POST /tasks/email
```

Request body:
```json
{
  "recipient": "user@example.com",
  "subject": "Hello",
  "body": "This is a test email",
  "attachments": [
    {
      "filename": "test.pdf",
      "path": "/path/to/file.pdf"
    }
  ],
  "cc": ["cc@example.com"],
  "bcc": ["bcc@example.com"]
}
```

### Queue a Notification Task

```
POST /tasks/notification
```

Request body:
```json
{
  "userId": "user-123",
  "message": "You have a new message",
  "channel": "app",
  "priority": "high",
  "data": {
    "redirectUrl": "/messages/123"
  }
}
```

### Queue a Data Processing Task

```
POST /tasks/data-processing
```

Request body:
```json
{
  "userId": "user-123",
  "operation": "generate-report",
  "data": {
    "reportType": "monthly",
    "month": "January",
    "year": 2023
  },
  "options": {
    "format": "pdf"
  }
}
```

## Task Status Events

The following events are published to NATS:

- `task.queued` - When a task is queued
- `task.processing` - When a task starts processing
- `task.completed` - When a task is completed successfully
- `task.failed` - When a task fails

Event payload structure:
```json
{
  "id": "123e4567-e89b-12d3-a456-426614174000",
  "type": "email",
  "status": "completed",
  "timestamp": "2023-01-01T12:00:00.000Z",
  "error": "Error message (only for failed tasks)"
}
```

## Subscribing to Task Events

You can subscribe to task events using the NatsService:

```typescript
import { Injectable, OnModuleInit } from '@nestjs/common';
import { NatsService } from '../nats/nats.service';

@Injectable()
export class YourService implements OnModuleInit {
  constructor(private readonly natsService: NatsService) {}

  async onModuleInit() {
    // Subscribe to task completion events
    await this.natsService.subscribe('task.completed', async (data) => {
      console.log(`Task ${data.id} completed`);
      // Handle task completion
    });

    // Subscribe to task failure events
    await this.natsService.subscribe('task.failed', async (data) => {
      console.log(`Task ${data.id} failed: ${data.error}`);
      // Handle task failure
    });
  }
}
```

## Configuration

The module uses the following configuration values:

- `rabbitmq.url` - The URL of the RabbitMQ server (default: "amqp://localhost:5672")
- `rabbitmq.queue` - The name of the RabbitMQ queue (default: "tasks")
- `nats.url` - The URL of the NATS server (default: "nats://localhost:4222")

You can configure these values in your configuration files or environment variables.
import { Body, Controller, Post, Get, Param, UseGuards, Logger } from '@nestjs/common';
import { TasksService } from './tasks.service';
import { AuthGuard } from '../common/guards/auth.guard';
import { v4 as uuidv4 } from 'uuid';
import { ZodValidationPipe } from '../common/pipes/zod-validation.pipe';
import { 
  TaskSchema, 
  EmailTaskPayloadSchema, 
  NotificationTaskPayloadSchema,
  DataProcessingTaskPayloadSchema
} from './tasks.schema';
import { z } from 'zod';

// Task creation schema
const CreateTaskSchema = z.object({
  type: z.enum(['email', 'notification', 'data-processing']),
  payload: z.record(z.any()),
});

type CreateTaskDto = z.infer<typeof CreateTaskSchema>;

@Controller('tasks')
export class TasksController {
  private readonly logger = new Logger(TasksController.name);

  constructor(private readonly tasksService: TasksService) {}

  @Post()
  @UseGuards(AuthGuard)
  async createTask(
    @Body(new ZodValidationPipe(CreateTaskSchema)) createTaskDto: CreateTaskDto,
  ) {
    const taskId = uuidv4();
    
    const taskData = {
      id: taskId,
      type: createTaskDto.type,
      payload: createTaskDto.payload,
      createdAt: new Date(),
    };
    
    const success = await this.tasksService.queueTask(taskData);
    
    return {
      success,
      taskId,
      message: success ? 'Task queued successfully' : 'Failed to queue task',
    };
  }

  @Post('email')
  @UseGuards(AuthGuard)
  async createEmailTask(
    @Body(new ZodValidationPipe(EmailTaskPayloadSchema)) payload: z.infer<typeof EmailTaskPayloadSchema>,
  ) {
    const taskId = uuidv4();
    
    const taskData = {
      id: taskId,
      type: 'email' as const,
      payload,
      createdAt: new Date(),
    };
    
    const success = await this.tasksService.queueTask(taskData);
    
    return {
      success,
      taskId,
      message: success ? 'Email task queued successfully' : 'Failed to queue email task',
    };
  }

  @Post('notification')
  @UseGuards(AuthGuard)
  async createNotificationTask(
    @Body(new ZodValidationPipe(NotificationTaskPayloadSchema)) payload: z.infer<typeof NotificationTaskPayloadSchema>,
  ) {
    const taskId = uuidv4();
    
    const taskData = {
      id: taskId,
      type: 'notification' as const,
      payload,
      createdAt: new Date(),
    };
    
    const success = await this.tasksService.queueTask(taskData);
    
    return {
      success,
      taskId,
      message: success ? 'Notification task queued successfully' : 'Failed to queue notification task',
    };
  }

  @Post('data-processing')
  @UseGuards(AuthGuard)
  async createDataProcessingTask(
    @Body(new ZodValidationPipe(DataProcessingTaskPayloadSchema)) payload: z.infer<typeof DataProcessingTaskPayloadSchema>,
  ) {
    const taskId = uuidv4();
    
    const taskData = {
      id: taskId,
      type: 'data-processing' as const,
      payload,
      createdAt: new Date(),
    };
    
    const success = await this.tasksService.queueTask(taskData);
    
    return {
      success,
      taskId,
      message: success ? 'Data processing task queued successfully' : 'Failed to queue data processing task',
    };
  }
} 
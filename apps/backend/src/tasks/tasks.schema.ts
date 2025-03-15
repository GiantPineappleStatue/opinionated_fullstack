import { z } from 'zod';

// Base task schema
export const TaskSchema = z.object({
  id: z.string().uuid(),
  type: z.enum(['email', 'notification', 'data-processing']),
  payload: z.record(z.any()),
  createdAt: z.date().optional().default(() => new Date()),
});

export type Task = z.infer<typeof TaskSchema>;

// Email task payload schema
export const EmailTaskPayloadSchema = z.object({
  recipient: z.string().email(),
  subject: z.string().min(1),
  body: z.string().min(1),
  attachments: z.array(z.object({
    filename: z.string(),
    content: z.string().optional(),
    path: z.string().optional(),
  })).optional(),
  cc: z.array(z.string().email()).optional(),
  bcc: z.array(z.string().email()).optional(),
});

export type EmailTaskPayload = z.infer<typeof EmailTaskPayloadSchema>;

// Notification task payload schema
export const NotificationTaskPayloadSchema = z.object({
  userId: z.string(),
  message: z.string().min(1),
  channel: z.enum(['app', 'sms', 'push']).optional().default('app'),
  priority: z.enum(['low', 'medium', 'high']).optional().default('medium'),
  data: z.record(z.any()).optional(),
});

export type NotificationTaskPayload = z.infer<typeof NotificationTaskPayloadSchema>;

// Data processing task payload schema
export const DataProcessingTaskPayloadSchema = z.object({
  userId: z.string(),
  operation: z.string(),
  data: z.record(z.any()),
  options: z.record(z.any()).optional(),
});

export type DataProcessingTaskPayload = z.infer<typeof DataProcessingTaskPayloadSchema>;

// Task status schema
export const TaskStatusSchema = z.enum([
  'queued',
  'processing',
  'completed',
  'failed',
  'cancelled',
]);

export type TaskStatus = z.infer<typeof TaskStatusSchema>;

// Task result schema
export const TaskResultSchema = z.object({
  taskId: z.string().uuid(),
  status: TaskStatusSchema,
  result: z.any().optional(),
  error: z.string().optional(),
  completedAt: z.date().optional(),
});

export type TaskResult = z.infer<typeof TaskResultSchema>; 
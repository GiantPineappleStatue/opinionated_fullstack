import { Controller, Post, Get, Body, HttpException, HttpStatus } from '@nestjs/common';
import { NatsService } from './nats.service';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { Public } from '../common/decorators/public.decorator';

@ApiTags('nats')
@Controller('nats')
export class NatsController {
  constructor(private readonly natsService: NatsService) {}

  @Public()
  @Post('test')
  @ApiOperation({ summary: 'Test NATS connection', description: 'Send a test message over NATS to the Python service' })
  @ApiResponse({ status: 200, description: 'Test message sent successfully' })
  @ApiResponse({ status: 500, description: 'Failed to send test message' })
  async testNatsConnection(@Body() body: Record<string, any> = {}) {
    try {
      const testMessage = {
        id: `test-${Date.now()}`,
        message: 'Hello from NestJS!',
        timestamp: new Date().toISOString(),
        ...body,
      };

      await this.natsService.publish('test.message', testMessage);
      
      return {
        success: true,
        message: 'Test message sent successfully',
        data: testMessage,
      };
    } catch (error) {
      throw new HttpException(
        {
          success: false,
          message: 'Failed to send test message',
          error: error.message,
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
} 
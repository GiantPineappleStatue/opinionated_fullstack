import { Controller, Post, Body, Get, Query, Res } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBody, ApiQuery } from '@nestjs/swagger';
import { Response } from 'express';
import { OpenAIService } from './openai.service';
import { Public } from '../common/decorators/public.decorator';

// Define request DTO
class CompletionRequestDto {
  prompt: string;
  systemMessage?: string;
  temperature?: number;
  maxTokens?: number;
}

@ApiTags('openai')
@Controller('openai')
export class OpenAIController {
  constructor(private readonly openaiService: OpenAIService) {}

  @Post('completions')
  @ApiOperation({ summary: 'Generate a completion using OpenAI' })
  @ApiBody({
    type: CompletionRequestDto,
    description: 'The completion request parameters',
  })
  @ApiResponse({
    status: 200,
    description: 'The completion response',
  })
  async generateCompletion(@Body() request: CompletionRequestDto) {
    return this.openaiService.generateCompletion(
      request.prompt,
      request.systemMessage,
      request.temperature,
      request.maxTokens,
    );
  }

  @Get('completions/stream')
  @ApiOperation({ summary: 'Get the URL for streaming completions' })
  @ApiQuery({ name: 'prompt', required: true, type: String })
  @ApiQuery({ name: 'systemMessage', required: false, type: String })
  @ApiQuery({ name: 'temperature', required: false, type: Number })
  @ApiQuery({ name: 'maxTokens', required: false, type: Number })
  @ApiResponse({
    status: 302,
    description: 'Redirect to the streaming endpoint',
  })
  streamCompletion(
    @Query('prompt') prompt: string,
    @Query('systemMessage') systemMessage?: string,
    @Query('temperature') temperature?: number,
    @Query('maxTokens') maxTokens?: number,
    @Res() res?: Response,
  ) {
    const streamingUrl = this.openaiService.getStreamingUrl(
      prompt,
      systemMessage,
      temperature !== undefined ? parseFloat(temperature.toString()) : undefined,
      maxTokens !== undefined ? parseInt(maxTokens.toString(), 10) : undefined,
    );

    // If response object is provided, redirect to the streaming URL
    if (res) {
      return res.redirect(streamingUrl);
    }

    // Otherwise, return the URL
    return { streamingUrl };
  }
} 
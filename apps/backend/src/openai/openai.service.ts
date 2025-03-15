import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { HttpService } from '@nestjs/axios';
import { lastValueFrom } from 'rxjs';
import { AxiosError } from 'axios';

@Injectable()
export class OpenAIService {
  private readonly logger = new Logger(OpenAIService.name);
  private readonly pythonServiceUrl: string;

  constructor(
    private readonly configService: ConfigService,
    private readonly httpService: HttpService,
  ) {
    this.pythonServiceUrl = this.configService.get<string>('PYTHON_SERVICE_URL') || 'http://python:8000';
    this.logger.log(`OpenAI service initialized with Python service URL: ${this.pythonServiceUrl}`);
  }

  /**
   * Generate a completion using the OpenAI API via the Python service
   */
  async generateCompletion(
    prompt: string,
    systemMessage?: string,
    temperature: number = 0.7,
    maxTokens?: number,
  ): Promise<any> {
    try {
      // Create the request configuration
      const url = `${this.pythonServiceUrl}/openai/completions`;
      const data = {
        prompt,
        system_message: systemMessage,
        temperature,
        max_tokens: maxTokens,
        stream: false,
      };

      // Make the HTTP request
      const axiosResponse = await this.httpService.axiosRef.post(url, data);
      return axiosResponse.data;
    } catch (error) {
      this.logger.error(`Error in generateCompletion: ${error.message}`, error.stack);
      throw new Error(`Failed to generate completion: ${error.message}`);
    }
  }

  /**
   * Get the streaming URL for OpenAI completions
   * This returns the URL that the frontend can use to connect directly to the streaming endpoint
   */
  getStreamingUrl(
    prompt: string,
    systemMessage?: string,
    temperature: number = 0.7,
    maxTokens?: number,
  ): string {
    // Encode the parameters for the URL
    const params = new URLSearchParams({
      prompt,
      ...(systemMessage && { system_message: systemMessage }),
      temperature: temperature.toString(),
      ...(maxTokens && { max_tokens: maxTokens.toString() }),
      stream: 'true',
    });

    return `${this.pythonServiceUrl}/openai/completions/stream?${params.toString()}`;
  }
} 
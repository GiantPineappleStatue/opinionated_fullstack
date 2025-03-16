import { Injectable, Logger, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as mysql from 'mysql2/promise';

@Injectable()
export class DatabaseService implements OnModuleInit, OnModuleDestroy {
  private connection: mysql.Connection;
  private readonly logger = new Logger(DatabaseService.name);
  private readonly isProduction: boolean;
  private readonly maxRetries = 5;
  private retryCount = 0;

  constructor(private configService: ConfigService) {
    this.isProduction = this.configService.get<string>('NODE_ENV') === 'production';
  }

  async onModuleInit() {
    await this.connectToDatabase();
  }

  private async connectToDatabase() {
    try {
      this.connection = await mysql.createConnection({
        host: this.configService.get<string>('database.host'),
        port: this.configService.get<number>('database.port'),
        user: this.configService.get<string>('database.username'),
        password: this.configService.get<string>('database.password'),
        database: this.configService.get<string>('database.database'),
        connectTimeout: 10000,
        waitForConnections: true,
      });

      // Test the connection
      await this.connection.ping();
      this.logger.log('Database connection established');
      this.retryCount = 0;

      // Handle connection errors
      this.connection.on('error', async (err) => {
        this.logger.error('Database connection error:', err);
        if (this.isProduction) {
          await this.handleConnectionError(err);
        }
      });
    } catch (error) {
      this.logger.error('Failed to connect to database:', error.stack);
      await this.handleConnectionError(error);
    }
  }

  private async handleConnectionError(error: Error) {
    if (this.isProduction) {
      if (this.retryCount < this.maxRetries) {
        this.retryCount++;
        this.logger.warn(`Retrying database connection (attempt ${this.retryCount}/${this.maxRetries})`);
        await new Promise(resolve => setTimeout(resolve, 5000));
        await this.connectToDatabase();
      } else {
        this.logger.error('Max database connection retries reached. Exiting application.');
        process.exit(1);
      }
    }
  }

  async onModuleDestroy() {
    if (this.connection) {
      await this.connection.end();
      this.logger.log('Database connection closed');
    }
  }

  /**
   * Execute a query within a transaction
   * @param callback Function that receives a connection and performs database operations
   * @returns The result of the callback function
   */
  async transaction<T>(callback: (connection: mysql.Connection) => Promise<T>): Promise<T> {
    if (!this.connection) {
      throw new Error('Database connection not initialized');
    }

    await this.connection.beginTransaction();
    try {
      const result = await callback(this.connection);
      await this.connection.commit();
      return result;
    } catch (error) {
      await this.connection.rollback();
      this.logger.error('Database transaction error:', error);
      throw error;
    }
  }

  /**
   * Execute a query with automatic retries
   */
  async query<T>(sql: string, params?: any[]): Promise<T> {
    if (!this.connection) {
      throw new Error('Database connection not initialized');
    }

    let retries = 0;
    const maxRetries = 3;

    while (retries < maxRetries) {
      try {
        const [result] = await this.connection.query(sql, params);
        return result as T;
      } catch (error) {
        retries++;
        if (this.isRetryableError(error) && retries < maxRetries) {
          await new Promise(resolve => setTimeout(resolve, 1000 * retries));
          continue;
        }
        throw error;
      }
    }

    throw new Error('Max query retries reached');
  }

  private isRetryableError(error: any): boolean {
    const retryableCodes = [
      'ER_LOCK_DEADLOCK',
      'ER_LOCK_WAIT_TIMEOUT',
      'ER_TOO_MANY_CONNECTIONS',
      'PROTOCOL_CONNECTION_LOST',
      'ER_CON_COUNT_ERROR',
    ];

    return retryableCodes.includes(error.code);
  }
} 
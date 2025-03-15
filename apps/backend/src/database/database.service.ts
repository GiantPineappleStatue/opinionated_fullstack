import { Injectable, Logger, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as mysql from 'mysql2/promise';

// Mock database connection for when the real database is disabled
class MockDatabaseConnection {
  private logger = new Logger('MockDatabaseConnection');

  constructor() {
    this.logger.log('Using mock database connection');
  }

  async query(sql: string, params?: any[]): Promise<any> {
    this.logger.debug(`[MOCK] QUERY: ${sql}`);
    return [[], []];
  }

  async execute(sql: string, params?: any[]): Promise<any> {
    this.logger.debug(`[MOCK] EXECUTE: ${sql}`);
    return [{ affectedRows: 0, insertId: 0 }, []];
  }

  async beginTransaction(): Promise<void> {
    this.logger.debug('[MOCK] BEGIN TRANSACTION');
  }

  async commit(): Promise<void> {
    this.logger.debug('[MOCK] COMMIT');
  }

  async rollback(): Promise<void> {
    this.logger.debug('[MOCK] ROLLBACK');
  }

  async end(): Promise<void> {
    this.logger.debug('[MOCK] CONNECTION CLOSED');
  }
}

@Injectable()
export class DatabaseService implements OnModuleInit, OnModuleDestroy {
  private connection: mysql.Connection | MockDatabaseConnection;
  private readonly logger = new Logger(DatabaseService.name);
  private enabled = true;

  constructor(private configService: ConfigService) {
    this.enabled = this.configService.get<boolean>('database.enabled') !== false;
  }

  async onModuleInit() {
    if (!this.enabled) {
      this.logger.log('Database is disabled. Using mock implementation.');
      this.connection = new MockDatabaseConnection();
      return;
    }

    try {
      this.connection = await mysql.createConnection({
        host: this.configService.get<string>('database.host'),
        port: this.configService.get<number>('database.port'),
        user: this.configService.get<string>('database.username'),
        password: this.configService.get<string>('database.password'),
        database: this.configService.get<string>('database.database'),
      });

      this.logger.log('Database connection established');
    } catch (error) {
      this.logger.error('Failed to connect to database. Using mock implementation.', error.stack);
      this.connection = new MockDatabaseConnection();
    }
  }

  async onModuleDestroy() {
    if (this.connection instanceof MockDatabaseConnection) {
      await this.connection.end();
    } else if (this.connection) {
      await this.connection.end();
    }
    this.logger.log('Database connection closed');
  }

  /**
   * Execute a query within a transaction
   * @param callback Function that receives a connection and performs database operations
   * @returns The result of the callback function
   */
  async transaction<T>(callback: (connection: mysql.Connection) => Promise<T>): Promise<T> {
    if (this.connection instanceof MockDatabaseConnection) {
      this.logger.warn('Attempting to use transaction with mock database. Executing callback directly.');
      try {
        return await callback(this.connection as any);
      } catch (error) {
        this.logger.error('Database transaction error:', error);
        throw error;
      }
    }

    await this.connection.beginTransaction();
    try {
      const result = await callback(this.connection as mysql.Connection);
      await this.connection.commit();
      return result;
    } catch (error) {
      await this.connection.rollback();
      this.logger.error('Database transaction error:', error);
      throw error;
    }
  }
} 
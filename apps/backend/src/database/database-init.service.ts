import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { DatabaseService } from './database.service';
import * as fs from 'fs';
import * as path from 'path';

@Injectable()
export class DatabaseInitService implements OnModuleInit {
  private readonly logger = new Logger(DatabaseInitService.name);
  private enabled = true;

  constructor(
    private readonly configService: ConfigService,
    private readonly databaseService: DatabaseService,
  ) {
    this.enabled = this.configService.get<boolean>('database.enabled') !== false;
  }

  async onModuleInit() {
    if (!this.enabled) {
      this.logger.log('Database is disabled. Skipping initialization.');
      return;
    }
    
    await this.initializeDatabase();
  }

  async initializeDatabase() {
    try {
      this.logger.log('Initializing database...');
      
      // Try multiple possible paths for the SQL script
      const possiblePaths = [
        path.join(__dirname, 'scripts', 'init-db.sql'),
        path.join(process.cwd(), 'apps', 'backend', 'src', 'database', 'scripts', 'init-db.sql'),
        path.join(process.cwd(), 'apps', 'backend', 'dist', 'database', 'scripts', 'init-db.sql'),
      ];
      
      let scriptPath = '';
      let scriptExists = false;
      
      for (const p of possiblePaths) {
        if (fs.existsSync(p)) {
          scriptPath = p;
          scriptExists = true;
          this.logger.log(`Found SQL script at ${p}`);
          break;
        }
      }
      
      if (!scriptExists) {
        this.logger.warn('SQL script not found. Skipping database initialization.');
        return;
      }
      
      // Read the SQL script
      const sqlScript = fs.readFileSync(scriptPath, 'utf8');
      
      // Split the script into individual statements
      const statements = sqlScript
        .split(';')
        .filter(statement => statement.trim() !== '');
      
      // Execute all statements within a transaction
      await this.databaseService.transaction(async (connection) => {
        // Execute each statement
        for (const statement of statements) {
          if (statement.trim()) {
            await connection.query(statement + ';');
          }
        }
      });
      
      this.logger.log('Database initialized successfully');
    } catch (error) {
      this.logger.error('Failed to initialize database', error.stack);
      // Don't throw the error, just log it
    }
  }
} 
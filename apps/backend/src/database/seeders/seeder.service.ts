import { Injectable, Logger } from '@nestjs/common';
import { UserSeeder } from './user.seeder';

/**
 * SeederService - Manages all database seeders
 * 
 * This service is responsible for running all seeders in the correct order.
 * It can be used to seed the database with initial data for development or testing.
 */
@Injectable()
export class SeederService {
  private readonly logger = new Logger(SeederService.name);

  constructor(private readonly userSeeder: UserSeeder) {}

  /**
   * Run all seeders
   */
  async seed(): Promise<void> {
    this.logger.log('Starting database seeding...');
    
    try {
      // Run seeders in order
      await this.userSeeder.seed();
      
      this.logger.log('Database seeding completed successfully');
    } catch (error) {
      this.logger.error('Database seeding failed', error.stack);
      throw error;
    }
  }
} 
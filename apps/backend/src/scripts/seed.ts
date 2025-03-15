import { NestFactory } from '@nestjs/core';
import { SeederModule } from '../database/seeders/seeder.module';
import { SeederService } from '../database/seeders/seeder.service';
import { Logger } from '@nestjs/common';

/**
 * Script to seed the database with initial data
 * 
 * Usage: npm run seed
 */
async function bootstrap() {
  const logger = new Logger('Seed');
  
  try {
    logger.log('Starting database seeding...');
    
    // Create a standalone application
    const app = await NestFactory.createApplicationContext(SeederModule);
    
    // Get the seeder service
    const seederService = app.get(SeederService);
    
    // Run the seeders
    await seederService.seed();
    
    // Close the application
    await app.close();
    
    logger.log('Database seeding completed successfully');
    process.exit(0);
  } catch (error) {
    logger.error('Database seeding failed', error.stack);
    process.exit(1);
  }
}

bootstrap(); 
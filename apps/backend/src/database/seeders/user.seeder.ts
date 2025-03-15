import { Injectable, Logger } from '@nestjs/common';
import { DatabaseService } from '../database.service';
import * as bcrypt from 'bcrypt';
import { uuidv7 } from 'uuidv7';
import { UserRole } from '../../common/guards/roles.guard';

/**
 * UserSeeder - Seeds the database with initial users
 * 
 * Seeders are used to populate the database with initial data for development or testing.
 * They can also be used to ensure that certain data exists in production (like admin users).
 */
@Injectable()
export class UserSeeder {
  private readonly logger = new Logger(UserSeeder.name);

  constructor(private readonly databaseService: DatabaseService) {}

  /**
   * Seed the users table with initial data
   */
  async seed(): Promise<void> {
    this.logger.log('Seeding users...');

    // Use transaction for all database operations
    await this.databaseService.transaction(async (connection) => {
      // Check if users table exists
      try {
        await connection.query('SELECT 1 FROM users LIMIT 1');
      } catch (error) {
        this.logger.error('Users table does not exist. Run migrations first.');
        return;
      }

      // Check if users table is empty
      const [rows] = await connection.query('SELECT COUNT(*) as count FROM users');
      const users = rows as any[];
      
      if (users[0].count > 0) {
        this.logger.log('Users table already has data. Skipping seeding.');
        return;
      }

      // Create admin user
      const adminId = uuidv7();
      const adminPassword = await bcrypt.hash('admin123', 10);
      
      await connection.execute(
        'INSERT INTO users (id, email, password, name, role) VALUES (?, ?, ?, ?, ?)',
        [adminId, 'admin@example.com', adminPassword, 'Admin User', UserRole.ADMIN],
      );
      
      this.logger.log('Admin user created');

      // Create regular user
      const userId = uuidv7();
      const userPassword = await bcrypt.hash('user123', 10);
      
      await connection.execute(
        'INSERT INTO users (id, email, password, name, role) VALUES (?, ?, ?, ?, ?)',
        [userId, 'user@example.com', userPassword, 'Regular User', UserRole.USER],
      );
      
      this.logger.log('Regular user created');

      // Create test users
      for (let i = 1; i <= 10; i++) {
        const testUserId = uuidv7();
        const testUserPassword = await bcrypt.hash('password', 10);
        
        // Every third user will have a null name to test nullable name handling
        const testName = i % 3 === 0 ? null : `Test User ${i}`;
        
        await connection.execute(
          'INSERT INTO users (id, email, password, name, role) VALUES (?, ?, ?, ?, ?)',
          [testUserId, `test${i}@example.com`, testUserPassword, testName, UserRole.USER],
        );
        
        this.logger.log(`Created test user: test${i}@example.com${testName ? '' : ' (with null name)'}`);
      }
      
      this.logger.log('Test users created');
    });
    
    this.logger.log('User seeding completed');
  }
} 
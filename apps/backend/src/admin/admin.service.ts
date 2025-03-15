import { Injectable, ForbiddenException, NotFoundException } from '@nestjs/common';
import { DatabaseService } from '../database/database.service';
import { UserRole } from '../common/guards/roles.guard';
import { User } from '../auth/entities/user.entity';

@Injectable()
export class AdminService {
  constructor(private readonly databaseService: DatabaseService) {}

  async getAllUsers() {
    return this.databaseService.transaction(async (connection) => {
      const [rows] = await connection.query(
        'SELECT id, email, name, role, created_at as createdAt, updated_at as updatedAt FROM users'
      );
      
      return rows;
    });
  }

  async promoteUserToAdmin(userId: string, adminId: string) {
    return this.databaseService.transaction(async (connection) => {
      // Check if the user to be promoted exists
      const [userRows] = await connection.query(
        'SELECT id FROM users WHERE id = ?',
        [userId]
      );
      
      const users = userRows as any[];
      if (!users || users.length === 0) {
        throw new NotFoundException('User not found');
      }

      // Check if the admin user exists and is an admin
      const [adminRows] = await connection.query(
        'SELECT role FROM users WHERE id = ?',
        [adminId]
      );
      
      const admins = adminRows as any[];
      if (!admins || admins.length === 0) {
        throw new NotFoundException('Admin user not found');
      }

      const adminUser = User.fromDatabaseRow(admins[0]);
      if (adminUser.role !== UserRole.ADMIN) {
        throw new ForbiddenException('Only admins can promote users');
      }

      // Promote the user to admin
      await connection.execute(
        'UPDATE users SET role = ? WHERE id = ?',
        [UserRole.ADMIN, userId]
      );

      // Return the updated user
      const [updatedRows] = await connection.query(
        'SELECT id, email, name, role, created_at as createdAt, updated_at as updatedAt FROM users WHERE id = ?',
        [userId]
      );
      
      const updatedUsers = updatedRows as any[];
      return updatedUsers[0];
    });
  }
} 
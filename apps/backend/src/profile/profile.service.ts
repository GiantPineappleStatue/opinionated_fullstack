import { Injectable, NotFoundException, UnauthorizedException, BadRequestException } from '@nestjs/common';
import { DatabaseService } from '../database/database.service';
import { AuthService } from '../auth/auth.service';
import { Request } from 'express';
import * as path from 'path';
import * as fs from 'fs/promises';
import * as crypto from 'crypto';

export interface Profile {
  id: string;
  userId: string;
  bio: string | null;
  avatarUrl: string | null;
  socialLinks: {
    twitter?: string;
    github?: string;
    linkedin?: string;
    website?: string;
  };
  createdAt: Date;
  updatedAt: Date;
}

interface UploadedFile {
  fieldname: string;
  originalname: string;
  encoding: string;
  mimetype: string;
  buffer: Buffer;
  size: number;
}

@Injectable()
export class ProfileService {
  private readonly UPLOAD_DIR = path.join(process.cwd(), 'uploads', 'avatars');
  private readonly ALLOWED_MIME_TYPES = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
  private readonly MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB

  constructor(
    private readonly databaseService: DatabaseService,
    private readonly authService: AuthService,
  ) {
    // Ensure upload directory exists
    this.ensureUploadDir();
  }

  private async ensureUploadDir() {
    try {
      await fs.mkdir(this.UPLOAD_DIR, { recursive: true });
    } catch (error) {
      console.error('Failed to create upload directory:', error);
    }
  }

  async getProfile(req: Request): Promise<Profile> {
    const userId = await this.authService.extractUserId(req);
    if (!userId) {
      throw new UnauthorizedException('Not authenticated');
    }

    const profile = await this.databaseService.transaction(async (connection) => {
      const [rows] = await connection.query(
        'SELECT * FROM profiles WHERE user_id = ?',
        [userId]
      );
      
      const profiles = rows as any[];
      return profiles.length > 0 ? profiles[0] : null;
    });

    if (!profile) {
      // Create a default profile if none exists
      return this.createDefaultProfile(userId);
    }

    return {
      id: profile.id,
      userId: profile.user_id,
      bio: profile.bio,
      avatarUrl: profile.avatar_url,
      socialLinks: profile.social_links ? JSON.parse(profile.social_links) : {},
      createdAt: profile.created_at,
      updatedAt: profile.updated_at,
    };
  }

  async updateProfile(req: Request, updateData: Partial<Profile>): Promise<Profile> {
    const userId = await this.authService.extractUserId(req);
    if (!userId) {
      throw new UnauthorizedException('Not authenticated');
    }

    const profile = await this.databaseService.transaction(async (connection) => {
      // Check if profile exists
      const [existingRows] = await connection.query(
        'SELECT * FROM profiles WHERE user_id = ?',
        [userId]
      );
      
      const existingProfiles = existingRows as any[];
      const existingProfile = existingProfiles.length > 0 ? existingProfiles[0] : null;

      if (!existingProfile) {
        // Create a default profile if none exists
        return this.createDefaultProfile(userId);
      }

      // Update the profile
      const updates: string[] = [];
      const values: any[] = [];

      if (updateData.bio !== undefined) {
        updates.push('bio = ?');
        values.push(updateData.bio);
      }

      if (updateData.avatarUrl !== undefined) {
        updates.push('avatar_url = ?');
        values.push(updateData.avatarUrl);
      }

      if (updateData.socialLinks !== undefined) {
        updates.push('social_links = ?');
        values.push(JSON.stringify(updateData.socialLinks));
      }

      if (updates.length === 0) {
        return existingProfile;
      }

      values.push(userId);

      await connection.execute(
        `UPDATE profiles SET ${updates.join(', ')}, updated_at = NOW() WHERE user_id = ?`,
        values
      );

      // Get updated profile
      const [rows] = await connection.query(
        'SELECT * FROM profiles WHERE user_id = ?',
        [userId]
      );
      
      const profiles = rows as any[];
      return profiles.length > 0 ? profiles[0] : null;
    });

    if (!profile) {
      throw new NotFoundException('Profile not found after update');
    }

    return {
      id: profile.id,
      userId: profile.user_id,
      bio: profile.bio,
      avatarUrl: profile.avatar_url,
      socialLinks: profile.social_links ? JSON.parse(profile.social_links) : {},
      createdAt: profile.created_at,
      updatedAt: profile.updated_at,
    };
  }

  private async createDefaultProfile(userId: string): Promise<Profile> {
    const profile = await this.databaseService.transaction(async (connection) => {
      const id = crypto.randomUUID();
      await connection.execute(
        'INSERT INTO profiles (id, user_id, bio, avatar_url, social_links, created_at, updated_at) VALUES (?, ?, ?, ?, ?, NOW(), NOW())',
        [id, userId, null, null, '{}']
      );

      const [rows] = await connection.query(
        'SELECT * FROM profiles WHERE id = ?',
        [id]
      );
      
      const profiles = rows as any[];
      return profiles.length > 0 ? profiles[0] : null;
    });

    if (!profile) {
      throw new Error('Failed to create default profile');
    }

    return {
      id: profile.id,
      userId: profile.user_id,
      bio: profile.bio,
      avatarUrl: profile.avatar_url,
      socialLinks: profile.social_links ? JSON.parse(profile.social_links) : {},
      createdAt: profile.created_at,
      updatedAt: profile.updated_at,
    };
  }

  async uploadAvatar(req: Request, file: UploadedFile): Promise<string> {
    const userId = await this.authService.extractUserId(req);
    if (!userId) {
      throw new UnauthorizedException('Not authenticated');
    }

    // Validate file
    if (!file.mimetype || !this.ALLOWED_MIME_TYPES.includes(file.mimetype)) {
      throw new BadRequestException('Invalid file type. Allowed types: JPEG, PNG, GIF, WebP');
    }

    if (file.size > this.MAX_FILE_SIZE) {
      throw new BadRequestException('File too large. Maximum size: 5MB');
    }

    // Generate unique filename
    const fileExt = path.extname(file.originalname);
    const fileName = `${userId}-${crypto.randomBytes(8).toString('hex')}${fileExt}`;
    const filePath = path.join(this.UPLOAD_DIR, fileName);

    try {
      // Save file
      await fs.writeFile(filePath, file.buffer);

      // Update profile with new avatar URL
      const avatarUrl = `/uploads/avatars/${fileName}`;
      await this.updateProfile(req, { avatarUrl });

      return avatarUrl;
    } catch (error) {
      console.error('Failed to save avatar:', error);
      throw new BadRequestException('Failed to save avatar');
    }
  }
} 
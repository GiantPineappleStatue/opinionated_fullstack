import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { DatabaseService } from './database.service';
import { DatabaseInitService } from './database-init.service';

@Module({
  imports: [ConfigModule],
  providers: [DatabaseService, DatabaseInitService],
  exports: [DatabaseService],
})
export class DatabaseModule {} 
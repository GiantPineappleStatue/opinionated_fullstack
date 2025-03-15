import { Module } from '@nestjs/common';
import { DatabaseModule } from '../database.module';
import { UserSeeder } from './user.seeder';
import { SeederService } from './seeder.service';

@Module({
  imports: [DatabaseModule],
  providers: [UserSeeder, SeederService],
  exports: [SeederService],
})
export class SeederModule {} 
import { Module } from '@nestjs/common';
import { MulterModule } from '@nestjs/platform-express';
import { MongooseModule } from '@nestjs/mongoose';
import { join } from 'path';
import { existsSync, mkdirSync } from 'fs';
import { SectionsController } from './sections.controller';
import { Section, SectionSchema } from './schemas/section.schema';
import { Task, TaskSchema } from '../lessons/schemas/task.schema';
import { User, UserSchema } from '../users/schemas/user.schema';

const sectionsUploadPath = join(process.cwd(), 'uploads', 'sections');

if (!existsSync(sectionsUploadPath)) {
  mkdirSync(sectionsUploadPath, { recursive: true });
}

@Module({
  imports: [
    MulterModule.register({
      dest: sectionsUploadPath,
    }),
    MongooseModule.forFeature([
      { name: Section.name, schema: SectionSchema },
      { name: Task.name, schema: TaskSchema },
      { name: User.name, schema: UserSchema },
    ]),
  ],
  controllers: [SectionsController],
  exports: [MulterModule],
})
export class SectionsModule {}

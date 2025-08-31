// src/courses/courses.module.ts
import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { CoursesController } from './courses.controller';
import { CoursesService } from './courses.service';
import { Course, CourseSchema } from './schemas/course.schema';
import { Unit, UnitSchema } from './schemas/unit.schema';
import { Section, SectionSchema } from './schemas/section.schema';
import {
  CourseRating,
  CourseRatingSchema,
} from './schemas/course-rating.schema';
import {
  UserProgress,
  UserProgressSchema,
} from '../users/schemas/user-progress.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Course.name, schema: CourseSchema },
      { name: Unit.name, schema: UnitSchema },
      { name: Section.name, schema: SectionSchema },
      { name: CourseRating.name, schema: CourseRatingSchema },
      { name: UserProgress.name, schema: UserProgressSchema },
    ]),
  ],
  controllers: [CoursesController],
  providers: [CoursesService],
  exports: [CoursesService],
})
export class CoursesModule {}

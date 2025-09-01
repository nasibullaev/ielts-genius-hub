// src/admin/admin.module.ts
import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { AdminController } from './admin.controller';
import { AdminService } from './admin.service';
import { User, UserSchema } from '../users/schemas/user.schema';
import {
  UserActivity,
  UserActivitySchema,
} from '../users/schemas/user-activity.schema';
import { Course, CourseSchema } from '../courses/schemas/course.schema';
import {
  CourseRating,
  CourseRatingSchema,
} from '../courses/schemas/course-rating.schema';
import {
  LevelCheck,
  LevelCheckSchema,
} from '../level-checker/schemas/level-check.schema';
import { Unit, UnitSchema } from '../courses/schemas/unit.schema';
import { Section, SectionSchema } from '../courses/schemas/section.schema';
import { Lesson, LessonSchema } from '../lessons/schemas/lesson.schema';
import {
  QuizQuestion,
  QuizQuestionSchema,
} from '../lessons/schemas/quiz-question.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: User.name, schema: UserSchema },
      { name: UserActivity.name, schema: UserActivitySchema },
      { name: Course.name, schema: CourseSchema },
      { name: CourseRating.name, schema: CourseRatingSchema },
      { name: LevelCheck.name, schema: LevelCheckSchema },
      { name: Unit.name, schema: UnitSchema }, // ✅ Add these
      { name: Section.name, schema: SectionSchema },
      { name: Lesson.name, schema: LessonSchema },
      { name: QuizQuestion.name, schema: QuizQuestionSchema },
    ]),
  ],
  controllers: [AdminController],
  providers: [AdminService],
})
export class AdminModule {}

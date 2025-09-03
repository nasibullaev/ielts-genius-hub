import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { CoursesController } from './courses.controller';
import { CoursesService } from './courses.service';
import { Course, CourseSchema } from './schemas/course.schema';
import { Unit, UnitSchema } from './schemas/unit.schema';
import { Section, SectionSchema } from './schemas/section.schema';
import { Lesson, LessonSchema } from '../lessons/schemas/lesson.schema';
import {
  CourseRating,
  CourseRatingSchema,
} from './schemas/course-rating.schema';
import {
  UserProgress,
  UserProgressSchema,
} from '../users/schemas/user-progress.schema';
import { User, UserSchema } from '../users/schemas/user.schema';
import { SectionsController } from './sections.controller';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Course.name, schema: CourseSchema },
      { name: Unit.name, schema: UnitSchema },
      { name: Section.name, schema: SectionSchema },
      { name: Lesson.name, schema: LessonSchema },
      { name: CourseRating.name, schema: CourseRatingSchema },
      { name: UserProgress.name, schema: UserProgressSchema },
      { name: User.name, schema: UserSchema },
    ]),
  ],
  controllers: [CoursesController, SectionsController],
  providers: [CoursesService],
  exports: [CoursesService],
})
export class CoursesModule {}

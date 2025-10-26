import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { LessonsController } from './lessons.controller';
import { LessonsService } from './lessons.service';
import { Lesson, LessonSchema } from './schemas/lesson.schema';
import {
  QuizQuestion,
  QuizQuestionSchema,
} from './schemas/quiz-question.schema';
import { Task, TaskSchema } from './schemas/task.schema';
import {
  UserActivity,
  UserActivitySchema,
} from '../users/schemas/user-activity.schema';
import {
  UserProgress,
  UserProgressSchema,
} from '../users/schemas/user-progress.schema';
import { User, UserSchema } from '../users/schemas/user.schema';
import { Section, SectionSchema } from '../courses/schemas/section.schema';
import { Unit, UnitSchema } from '../courses/schemas/unit.schema';
import { Course, CourseSchema } from '../courses/schemas/course.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Lesson.name, schema: LessonSchema },
      { name: QuizQuestion.name, schema: QuizQuestionSchema },
      { name: Task.name, schema: TaskSchema },
      { name: UserActivity.name, schema: UserActivitySchema },
      { name: UserProgress.name, schema: UserProgressSchema },
      { name: User.name, schema: UserSchema },
      { name: Section.name, schema: SectionSchema },
      { name: Unit.name, schema: UnitSchema },
      { name: Course.name, schema: CourseSchema },
    ]),
  ],
  controllers: [LessonsController],
  providers: [LessonsService],
})
export class LessonsModule {}

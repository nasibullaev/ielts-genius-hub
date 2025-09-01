import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { LessonsController } from './lessons.controller';
import { LessonsService } from './lessons.service';
import { Lesson, LessonSchema } from './schemas/lesson.schema';
import {
  QuizQuestion,
  QuizQuestionSchema,
} from './schemas/quiz-question.schema';
import {
  UserActivity,
  UserActivitySchema,
} from '../users/schemas/user-activity.schema';
import {
  UserProgress,
  UserProgressSchema,
} from '../users/schemas/user-progress.schema';
import { User, UserSchema } from '../users/schemas/user.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Lesson.name, schema: LessonSchema },
      { name: QuizQuestion.name, schema: QuizQuestionSchema },
      { name: UserActivity.name, schema: UserActivitySchema },
      { name: UserProgress.name, schema: UserProgressSchema },
      { name: User.name, schema: UserSchema },
    ]),
  ],
  controllers: [LessonsController],
  providers: [LessonsService],
})
export class LessonsModule {}

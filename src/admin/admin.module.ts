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

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: User.name, schema: UserSchema },
      { name: UserActivity.name, schema: UserActivitySchema },
      { name: Course.name, schema: CourseSchema },
      { name: CourseRating.name, schema: CourseRatingSchema },
    ]),
  ],
  controllers: [AdminController],
  providers: [AdminService],
})
export class AdminModule {}

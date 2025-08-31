import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type UserActivityDocument = UserActivity & Document;

@Schema({ timestamps: true })
export class UserActivity {
  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  userId: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'Lesson', required: true })
  lessonId: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'Course', required: true })
  courseId: Types.ObjectId;

  @Prop({ required: true, enum: ['completed', 'started', 'quiz_attempted'] })
  activityType: string;

  // For quiz activities
  @Prop()
  quizScore?: number; // Percentage score

  @Prop()
  quizAnswers?: number[]; // User's selected option indices

  @Prop()
  timeSpent?: number; // In minutes
}

export const UserActivitySchema = SchemaFactory.createForClass(UserActivity);

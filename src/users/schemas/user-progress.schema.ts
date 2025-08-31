import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type UserProgressDocument = UserProgress & Document;

@Schema({ timestamps: true })
export class UserProgress {
  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  userId: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'Course', required: true })
  courseId: Types.ObjectId;

  @Prop({ default: 0 })
  completedLessons: number;

  @Prop({ default: 0 })
  totalLessons: number;

  @Prop({ default: 0 })
  progressPercentage: number;

  @Prop({ default: Date.now })
  lastAccessed: Date;
}

export const UserProgressSchema = SchemaFactory.createForClass(UserProgress);

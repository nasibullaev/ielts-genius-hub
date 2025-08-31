// src/courses/schemas/course-rating.schema.ts
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type CourseRatingDocument = CourseRating & Document;

@Schema({ timestamps: true })
export class CourseRating {
  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  userId: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'Course', required: true })
  courseId: Types.ObjectId;

  @Prop({ required: true, min: 1, max: 5 })
  rating: number;

  @Prop()
  review?: string;
}

export const CourseRatingSchema = SchemaFactory.createForClass(CourseRating);

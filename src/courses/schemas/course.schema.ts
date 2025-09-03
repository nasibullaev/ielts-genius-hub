import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type CourseDocument = Course & Document;

@Schema({ timestamps: true })
export class Course {
  @Prop({ required: true })
  title: string;

  @Prop({ required: true })
  description: string;

  @Prop({ default: 0, min: 0, max: 5 })
  rating: number;

  @Prop({ required: true })
  duration: string;

  @Prop({ default: 0 })
  totalLessons: number;

  @Prop({ required: true, enum: ['Beginner', 'Intermediate', 'Advanced'] })
  level: string;

  @Prop()
  picture: string;

  @Prop({ default: 0 })
  ratingCount: number;

  @Prop({ default: 0 })
  totalRating: number;
}

export const CourseSchema = SchemaFactory.createForClass(Course);

// Enable virtuals in JSON and Object outputs
CourseSchema.set('toJSON', { virtuals: true });
CourseSchema.set('toObject', { virtuals: true });

// Virtual populate: Course → Units
CourseSchema.virtual('units', {
  ref: 'Unit',
  localField: '_id',
  foreignField: 'courseId',
});

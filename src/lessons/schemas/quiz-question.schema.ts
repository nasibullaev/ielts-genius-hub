// src/lessons/schemas/quiz-question.schema.ts
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type QuizQuestionDocument = QuizQuestion & Document;

@Schema({ timestamps: true })
export class QuizQuestion {
  @Prop({ type: Types.ObjectId, ref: 'Lesson', required: true })
  lessonId: Types.ObjectId;

  @Prop({ required: true })
  question: string;

  @Prop({ required: true, type: [String] })
  options: string[]; // Array of 4 options

  @Prop({ required: true, min: 0, max: 3 })
  correctOptionIndex: number; // 0-3

  @Prop({ required: true })
  order: number; // Question order in quiz
}

export const QuizQuestionSchema = SchemaFactory.createForClass(QuizQuestion);

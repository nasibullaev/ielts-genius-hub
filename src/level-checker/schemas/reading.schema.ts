import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export enum ReadingQuestionType {
  TRUE_FALSE_NOT_GIVEN = 'true_false_not_given',
  MULTIPLE_CHOICE = 'multiple_choice',
  INPUT_TEXT = 'input_text',
  MATCHING = 'matching',
  HEADING_MATCHING = 'heading_matching',
}

@Schema({ _id: false })
export class ReadingQuestion {
  @Prop({ required: true })
  question: string;

  @Prop({ required: true, enum: ReadingQuestionType })
  questionType: ReadingQuestionType;

  @Prop({ type: [String], required: false })
  options?: string[];

  @Prop({ required: true })
  correctAnswer: string;

  @Prop({ required: true })
  explanation: string;
}

@Schema({ _id: false })
export class ReadingDetailedResult {
  @Prop({ required: true })
  questionIndex: number;

  @Prop({ required: true })
  question: string;

  @Prop({ required: true })
  userAnswer: string;

  @Prop({ required: true })
  correctAnswer: string;

  @Prop({ required: true })
  isCorrect: boolean;

  @Prop({ required: true })
  explanation: string;
}

// Schema for storing reading tests (without correct answers)
@Schema({ timestamps: true })
export class ReadingTest extends Document {
  @Prop({ required: true })
  readingText: string;

  @Prop({ type: [ReadingQuestion], required: true })
  questions: ReadingQuestion[];

  @Prop({ required: true })
  testId: string; // Unique identifier for the test
}

// Schema for storing user submissions and results
@Schema({ timestamps: true })
export class ReadingSubmission extends Document {
  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  userId: Types.ObjectId;

  @Prop({ required: true })
  testId: string; // Reference to the reading test

  @Prop({ type: [String], required: true })
  userAnswers: string[];

  @Prop({ required: true })
  overallBand: string;

  @Prop({ required: true })
  correctAnswers: number;

  @Prop({ required: true })
  totalQuestions: number;

  @Prop({ required: true })
  percentage: number;

  @Prop({ type: [ReadingDetailedResult], required: true })
  detailedResults: ReadingDetailedResult[];

  @Prop({ required: true })
  feedback: string;

  @Prop({ type: [String], required: true })
  suggestions: string[];

  @Prop({ required: true })
  timeSpent: string;
}

export const ReadingTestSchema = SchemaFactory.createForClass(ReadingTest);
export const ReadingSubmissionSchema =
  SchemaFactory.createForClass(ReadingSubmission);

import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export enum QuestionType {
  TRUE_FALSE_NOT_GIVEN = 'true_false_not_given',
  MULTIPLE_CHOICE = 'multiple_choice',
  INPUT_TEXT = 'input_text',
}

@Schema({ _id: false })
export class Question {
  @Prop({ required: true })
  question: string;

  @Prop({ required: true, enum: QuestionType })
  questionType: QuestionType;

  @Prop({ type: [String], required: false })
  options?: string[];

  @Prop({ required: true })
  correctAnswer: string;

  @Prop({ required: true })
  explanation: string;
}

@Schema({ _id: false })
export class DetailedResult {
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

// Schema for storing listening tests (without correct answers)
@Schema({ timestamps: true })
export class ListeningTest extends Document {
  @Prop({ required: true })
  listeningText: string;

  @Prop({ type: [Question], required: true })
  questions: Question[];

  @Prop({ required: true })
  testId: string; // Unique identifier for the test
}

// Schema for storing user submissions and results
@Schema({ timestamps: true })
export class ListeningSubmission extends Document {
  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  userId: Types.ObjectId;

  @Prop({ required: true })
  testId: string; // Reference to the listening test

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

  @Prop({ type: [DetailedResult], required: true })
  detailedResults: DetailedResult[];

  @Prop({ required: true })
  feedback: string;

  @Prop({ type: [String], required: true })
  suggestions: string[];

  @Prop({ required: true })
  timeSpent: string;
}

export const ListeningTestSchema = SchemaFactory.createForClass(ListeningTest);
export const ListeningSubmissionSchema =
  SchemaFactory.createForClass(ListeningSubmission);

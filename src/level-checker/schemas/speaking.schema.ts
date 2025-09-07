import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export enum SpeakingQuestionType {
  PERSONAL_INTRODUCTION = 'personal_introduction',
  INDIVIDUAL_LONG_TURN = 'individual_long_turn',
  TWO_WAY_DISCUSSION = 'two_way_discussion',
}

@Schema({ _id: false })
export class SpeakingQuestion {
  @Prop({ required: true })
  question: string;

  @Prop({ required: true, enum: SpeakingQuestionType })
  questionType: SpeakingQuestionType;

  @Prop({ required: true })
  instructions: string;

  @Prop({ required: true })
  guidance: string;
}

@Schema({ _id: false })
export class SpeakingDetailedResult {
  @Prop({ required: true })
  questionIndex: number;

  @Prop({ required: true })
  question: string;

  @Prop({ required: true })
  userAnswer: string;

  @Prop({ required: true })
  fluencyScore: string;

  @Prop({ required: true })
  vocabularyScore: string;

  @Prop({ required: true })
  grammarScore: string;

  @Prop({ required: true })
  pronunciationScore: string;

  @Prop({ required: true })
  feedback: string;
}

// Schema for storing speaking tests (questions only)
@Schema({ timestamps: true })
export class SpeakingTest extends Document {
  @Prop({ type: [SpeakingQuestion], required: true })
  questions: SpeakingQuestion[];

  @Prop({ required: true })
  testId: string; // Unique identifier for the test
}

// Schema for storing user submissions and results
@Schema({ timestamps: true })
export class SpeakingSubmission extends Document {
  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  userId: Types.ObjectId;

  @Prop({ required: true })
  testId: string; // Reference to the speaking test

  @Prop({ type: [String], required: true })
  userAnswers: string[];

  @Prop({ required: true })
  overallBand: string;

  @Prop({ required: true })
  fluencyCoherence: string;

  @Prop({ required: true })
  lexicalResource: string;

  @Prop({ required: true })
  grammaticalRange: string;

  @Prop({ required: true })
  pronunciation: string;

  @Prop({ type: [SpeakingDetailedResult], required: true })
  detailedResults: SpeakingDetailedResult[];

  @Prop({ required: true })
  feedback: string;

  @Prop({ type: [String], required: true })
  suggestions: string[];

  @Prop({ required: true })
  timeSpent: string;
}

export const SpeakingTestSchema = SchemaFactory.createForClass(SpeakingTest);
export const SpeakingSubmissionSchema =
  SchemaFactory.createForClass(SpeakingSubmission);

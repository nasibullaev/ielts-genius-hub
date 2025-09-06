import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

@Schema({ timestamps: true })
export class WritingTask1 extends Document {
  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  userId: Types.ObjectId;

  @Prop({ required: true })
  question: string;

  @Prop({ required: true })
  imageUrl: string;

  @Prop({ required: true })
  imagePrompt: string;

  @Prop({ required: true })
  taskType: string;

  @Prop({ required: true })
  dataDescription: string;

  @Prop({ type: Object, required: true })
  chartData: object;

  @Prop({ required: true })
  answer: string;

  @Prop({ required: true })
  overallBand: string;

  @Prop({ required: true })
  taskAchievement: string;

  @Prop({ required: true })
  coherenceCohesion: string;

  @Prop({ required: true })
  lexicalResource: string;

  @Prop({ required: true })
  grammaticalRange: string;

  @Prop({ required: true })
  feedback: string;

  @Prop({ type: [String], required: true })
  suggestions: string[];

  @Prop({ required: true })
  wordCount: number;

  @Prop({ required: true })
  timeSpent: number;
}

export const WritingTask1Schema = SchemaFactory.createForClass(WritingTask1);

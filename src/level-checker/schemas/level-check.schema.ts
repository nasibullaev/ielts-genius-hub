import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type LevelCheckDocument = LevelCheck & Document;

@Schema({ timestamps: true })
export class LevelCheck {
  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  userId: Types.ObjectId;

  @Prop({ required: true })
  topic: string;

  @Prop({ required: true })
  essay: string;

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
  timeSpent: number; // in minutes
}

export const LevelCheckSchema = SchemaFactory.createForClass(LevelCheck);

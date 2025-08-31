import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type LessonDocument = Lesson & Document;

@Schema({ timestamps: true })
export class Lesson {
  @Prop({ required: true })
  title: string;

  @Prop({ required: true })
  description: string;

  @Prop({ type: Types.ObjectId, ref: 'Section', required: true })
  sectionId: Types.ObjectId;

  @Prop({ required: true, enum: ['Video', 'Text', 'Quiz', 'File'] })
  type: string;

  @Prop({ required: true })
  order: number; // Lesson order in section

  // Video lesson
  @Prop()
  videoUrl?: string; // YouTube URL

  // Text lesson
  @Prop()
  textContent?: string; // HTML or markdown content

  // File lesson
  @Prop()
  fileUrl?: string;

  @Prop()
  fileName?: string;

  // Quiz lesson - questions are stored separately
}

export const LessonSchema = SchemaFactory.createForClass(Lesson);

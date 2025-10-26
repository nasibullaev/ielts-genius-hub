import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export enum TaskType {
  // Basic types
  LEAD_IN = 'Lead-in',
  VIDEO = 'Video',
  TEXT = 'Text',
  FILE = 'File',

  // Interactive types
  LISTENING_MCQ = 'Listening (Audio + MCQ)',
  RECORDING = 'Recording (Speaking Prompt)',
  MATCHING = 'Matching',
  RANKING = 'Ranking',
  FILL_IN_BLANK = 'Fill-in-the-Blank',
  MULTIPLE_CHOICE = 'Multiple Choice (Reading)',
  TRUE_FALSE = 'True/False',
  SUMMARY_CLOZE = 'Summary (Cloze)',
  DRAG_DROP = 'Drag-and-Drop (Categorization)',
  PARAPHRASE = 'Paraphrase (Typing Input)',
  SENTENCE_REORDERING = 'Sentence Reordering',
  SPEAKING_PART2_CUE_CARD = 'Speaking – Part 2 Cue Card',
  SPEAKING_PART3_DISCUSSION = 'Speaking – Part 3 Discussion',
}

export type TaskDocument = Task & Document;

@Schema({ timestamps: true })
export class Task {
  @Prop({ type: Types.ObjectId, ref: 'Lesson', required: true })
  lessonId: Types.ObjectId;

  @Prop({ required: true, enum: TaskType })
  type: TaskType;

  @Prop({ required: true })
  order: number; // Task order in lesson

  @Prop()
  title?: string;

  @Prop()
  description?: string;

  // Common fields
  @Prop()
  textPrompt?: string; // For Lead-in, Paraphrase, etc.

  @Prop()
  imageUrl?: string; // For Lead-in, etc.

  @Prop()
  audioUrl?: string; // For Listening, Recording, Speaking tasks

  // Listening MCQ fields
  @Prop({ type: [String] })
  options?: string[];

  @Prop({ type: Number })
  correctOptionIndex?: number; // Single choice

  @Prop({ type: [Number] })
  correctOptionIndices?: number[]; // Multiple choice

  // Recording fields
  @Prop()
  promptText?: string;

  @Prop()
  maxDuration?: number; // in seconds

  @Prop()
  sampleAnswerAudioUrl?: string;

  // Matching fields
  @Prop({ type: [{ left: String, right: String }] })
  pairs?: { left: string; right: string }[];

  @Prop({ type: [{ leftIndex: Number, rightIndex: Number }] })
  correctPairs?: { leftIndex: number; rightIndex: number }[];

  // Ranking fields
  @Prop({ type: [String] })
  items?: string[];

  @Prop({ type: [Number] })
  correctOrder?: number[];

  // Fill-in-the-Blank fields
  @Prop()
  textTemplate?: string; // Template with placeholders like "__1__"

  @Prop({ type: [String] })
  wordBank?: string[];

  @Prop({ type: Map, of: String })
  correctAnswers?: Map<string, string>; // position -> word

  // True/False fields
  @Prop({ type: [String] })
  statements?: string[];

  @Prop({ type: [Boolean] })
  correctFlags?: boolean[];

  // Drag-and-Drop fields
  @Prop({ type: [String] })
  categories?: string[];

  @Prop({ type: Map, of: [String] })
  correctMapping?: Map<string, string[]>; // category -> [items]

  // Sentence Reordering fields
  @Prop({ type: [String] })
  segments?: string[];

  // Paraphrase fields
  @Prop()
  baseSentence?: string;

  @Prop()
  modelAnswer?: string;

  // Speaking Part 2 Cue Card fields
  @Prop()
  cueCardText?: string;

  @Prop({ type: [String] })
  notesHint?: string[];

  // Speaking Part 3 Discussion fields
  @Prop()
  questionText?: string;

  @Prop({ type: [String] })
  keyPoints?: string[];
}

export const TaskSchema = SchemaFactory.createForClass(Task);

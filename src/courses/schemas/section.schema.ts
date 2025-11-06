import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type SectionDocument = Section & Document;

type Presentation = {
  title: string;
  cards: string[];
};

type QuickTips = {
  cards: string[];
};

@Schema({ timestamps: true })
export class Section {
  @Prop({ required: true })
  title: string;

  @Prop({ required: true })
  description: string;

  @Prop({ type: Types.ObjectId, ref: 'Unit', required: true })
  unitId: Types.ObjectId;

  @Prop({ required: true })
  order: number; // Section order in unit

  @Prop()
  image?: string;

  @Prop({ type: [String], default: [] })
  sessionPlans: string[];

  @Prop({
    _id: false,
    type: {
      title: { type: String, required: true },
      cards: {
        type: [String],
        required: true,
        validate: {
          validator: (value: string[]) =>
            Array.isArray(value) && value.length === 2,
          message: 'Presentation cards must contain exactly 2 items',
        },
      },
    },
    required: false,
  })
  presentation?: Presentation;

  @Prop({
    _id: false,
    type: {
      cards: {
        type: [String],
        required: true,
        validate: {
          validator: (value: string[]) =>
            Array.isArray(value) && value.length === 4,
          message: 'Quick tips must contain exactly 4 items',
        },
      },
    },
    required: false,
  })
  quickTips?: QuickTips;
}

export const SectionSchema = SchemaFactory.createForClass(Section);

// Enable virtuals in JSON and Object outputs
SectionSchema.set('toJSON', { virtuals: true });
SectionSchema.set('toObject', { virtuals: true });

// Virtual populate: Section → Tasks
SectionSchema.virtual('tasks', {
  ref: 'Task',
  localField: '_id',
  foreignField: 'sectionId',
});

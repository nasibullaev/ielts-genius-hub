import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type UnitDocument = Unit & Document;

@Schema({ timestamps: true })
export class Unit {
  @Prop({ required: true })
  title: string;

  @Prop({ required: true })
  description: string;

  @Prop({ type: Types.ObjectId, ref: 'Course', required: true })
  courseId: Types.ObjectId;

  @Prop({ required: true })
  order: number;
}

export const UnitSchema = SchemaFactory.createForClass(Unit);

// Enable virtuals in JSON and Object outputs
UnitSchema.set('toJSON', { virtuals: true });
UnitSchema.set('toObject', { virtuals: true });

// Virtual populate: Unit → Sections
UnitSchema.virtual('sections', {
  ref: 'Section',
  localField: '_id',
  foreignField: 'unitId',
});

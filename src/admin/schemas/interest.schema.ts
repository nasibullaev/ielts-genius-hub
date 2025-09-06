import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type InterestDocument = Interest & Document;

@Schema({ timestamps: true })
export class Interest {
  @Prop({ required: true, unique: true })
  name: string;

  @Prop({ required: true })
  icon: string; // Path to SVG file

  @Prop({ default: true })
  isActive: boolean; // Allow admin to enable/disable interests

  @Prop({ default: 0 })
  userCount: number; // Track how many users selected this interest
}

export const InterestSchema = SchemaFactory.createForClass(Interest);

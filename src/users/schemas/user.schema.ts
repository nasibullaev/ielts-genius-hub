// src/users/schemas/user.schema.ts
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type UserDocument = User & Document;

@Schema({ timestamps: true })
export class User {
  @Prop({ required: true, minlength: 2 })
  name: string;

  @Prop({ required: true, unique: true, lowercase: true })
  email: string;

  @Prop({
    required: true,
    unique: true,
    match: [/^\+?[1-9]\d{7,14}$/, 'Phone number must be valid'],
  })
  phone: string;

  @Prop({ required: true })
  password: string;

  @Prop({ default: 'student', enum: ['student', 'admin'] })
  role: string;
}

export const UserSchema = SchemaFactory.createForClass(User);

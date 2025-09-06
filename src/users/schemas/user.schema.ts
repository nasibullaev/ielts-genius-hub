import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

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

  @Prop({ default: false })
  isPaid: boolean; // ✅ Add payment status

  @Prop()
  subscriptionExpiry?: Date; // ✅ Add subscription expiry

  @Prop({ default: 0 })
  currentStreak: number; // ✅ Add streak tracking

  @Prop()
  lastActivityDate?: Date; // ✅ For streak calculation

  @Prop({
    type: [{ type: Types.ObjectId, ref: 'Interest' }],
    default: [],
    validate: {
      validator: function (interests: Types.ObjectId[]) {
        return interests.length <= 3;
      },
      message: 'User can select maximum 3 interests',
    },
  })
  interests: Types.ObjectId[]; // ✅ User's selected interests (max 3)
}

export const UserSchema = SchemaFactory.createForClass(User);

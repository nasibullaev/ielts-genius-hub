// src/payments/schemas/payment.schema.ts
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type PaymentDocument = Payment & Document;

@Schema({ timestamps: true })
export class Payment {
  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  userId: Types.ObjectId;

  @Prop({ required: true })
  amount: number;

  @Prop({ required: true, default: 'USD' })
  currency: string;

  @Prop({ required: true, enum: ['pending', 'completed', 'failed'] })
  status: string;

  @Prop({ required: true })
  paymentMethod: string; // 'mock_card'

  @Prop()
  transactionId: string;

  @Prop()
  cardLastFour: string; // Last 4 digits for display
}

export const PaymentSchema = SchemaFactory.createForClass(Payment);

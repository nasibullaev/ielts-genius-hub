// src/payments/payments.service.ts
import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Payment } from './schemas/payment.schema';
import { User } from '../users/schemas/user.schema';
import { CreatePaymentDto } from './dto/payment.dto';

@Injectable()
export class PaymentsService {
  constructor(
    @InjectModel(Payment.name) private paymentModel: Model<Payment>,
    @InjectModel(User.name) private userModel: Model<User>,
  ) {}

  async processPayment(userId: string, paymentDto: CreatePaymentDto) {
    // Mock payment processing
    const transactionId = `TXN_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const cardLastFour = paymentDto.cardNumber.slice(-4);

    // Create payment record
    const payment = new this.paymentModel({
      userId: new Types.ObjectId(userId),
      amount: paymentDto.amount,
      currency: 'USD',
      status: 'completed', // Mock success
      paymentMethod: 'mock_card',
      transactionId,
      cardLastFour,
    });

    await payment.save();

    // Update user payment status
    const subscriptionExpiry = new Date();
    subscriptionExpiry.setMonth(subscriptionExpiry.getMonth() + 1); // 1 month subscription

    await this.userModel.findByIdAndUpdate(userId, {
      isPaid: true,
      subscriptionExpiry,
    });

    return {
      success: true,
      message: 'Payment processed successfully',
      transactionId,
      subscriptionExpiry,
    };
  }

  async getPaymentHistory(userId: string) {
    return this.paymentModel
      .find({ userId })
      .select('-userId')
      .sort({ createdAt: -1 })
      .lean()
      .exec();
  }
}

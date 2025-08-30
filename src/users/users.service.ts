import {
  Injectable,
  ConflictException,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import * as bcrypt from 'bcrypt';
import { User } from './schemas/user.schema';

@Injectable()
export class UsersService {
  constructor(@InjectModel(User.name) private userModel: Model<User>) {}

  async findByEmail(email: string) {
    return this.userModel.findOne({ email }).lean().exec();
  }

  async findByPhone(phone: string) {
    return this.userModel.findOne({ phone }).lean().exec();
  }

  async findById(id: string): Promise<User | null> {
    return this.userModel.findById(id).select('-password').exec();
  }

  async create(
    name: string,
    email: string,
    phone: string,
    password: string,
    role: string,
  ): Promise<User> {
    // Check if email or phone already exists
    const existingUser = await this.userModel.findOne({
      $or: [{ email }, { phone }],
    });
    if (existingUser) {
      throw new ConflictException('Email or phone number already in use');
    }

    // Validate password strength
    const passwordRegex =
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&]).{8,}$/;
    if (!passwordRegex.test(password)) {
      throw new BadRequestException(
        'Password must be at least 8 characters long, include uppercase, lowercase, number, and special character',
      );
    }

    // Validate role
    const allowedRoles = ['student', 'admin'];
    if (!allowedRoles.includes(role)) {
      throw new BadRequestException(
        `Role must be one of: ${allowedRoles.join(', ')}`,
      );
    }

    // Hashing password AFTER validation
    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = new this.userModel({
      name,
      email,
      phone,
      password: hashedPassword,
      role,
    });

    return newUser.save();
  }

  async updateUser(id: string, updateData: Partial<User>): Promise<User> {
    const updatedUser = await this.userModel
      .findByIdAndUpdate(id, updateData, { new: true })
      .select('-password')
      .exec();

    if (!updatedUser) {
      throw new NotFoundException('User not found');
    }

    return updatedUser;
  }

  async deleteUser(id: string): Promise<void> {
    const result = await this.userModel.findByIdAndDelete(id).exec();
    if (!result) {
      throw new NotFoundException('User not found');
    }
  }
}

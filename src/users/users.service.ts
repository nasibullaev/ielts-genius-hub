import {
  Injectable,
  ConflictException,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import * as bcrypt from 'bcrypt';
import { User } from './schemas/user.schema';
import { Interest } from '../admin/schemas/interest.schema';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { ChangePasswordDto } from './dto/change-password.dto';
import { UpdateInterestsDto } from './dto/update-interests.dto';
import { SelectInterestsDto } from './dto/select-interests.dto';

@Injectable()
export class UsersService {
  constructor(
    @InjectModel(User.name) private userModel: Model<User>,
    @InjectModel(Interest.name) private interestModel: Model<Interest>,
    private jwtService: JwtService,
  ) {}

  async findByEmail(email: string) {
    return this.userModel
      .findOne({ email })
      .select('-hasSelectedInterests')
      .lean()
      .exec();
  }

  async findByPhone(phone: string) {
    return this.userModel
      .findOne({ phone })
      .select('-hasSelectedInterests')
      .lean()
      .exec();
  }

  async findById(id: string): Promise<User | null> {
    return this.userModel
      .findById(id)
      .select('-password -hasSelectedInterests')
      .exec();
  }

  async findByIdWithInterests(id: string): Promise<User | null> {
    return this.userModel
      .findById(id)
      .populate('interests', 'name icon')
      .select('-password -hasSelectedInterests')
      .exec();
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

  async updateProfile(id: string, updateData: UpdateProfileDto): Promise<User> {
    if (updateData.email || updateData.phone) {
      const existingUser = await this.userModel.findOne({
        _id: { $ne: id },
        $or: [
          ...(updateData.email ? [{ email: updateData.email }] : []),
          ...(updateData.phone ? [{ phone: updateData.phone }] : []),
        ],
      });

      if (existingUser) {
        throw new ConflictException('Email or phone number already in use');
      }
    }

    const updatedUser = await this.userModel
      .findByIdAndUpdate(id, updateData, { new: true })
      .select('-password')
      .exec();

    if (!updatedUser) {
      throw new NotFoundException('User not found');
    }

    return updatedUser;
  }

  async changePassword(
    id: string,
    changePasswordDto: ChangePasswordDto,
  ): Promise<{ message: string; access_token: string }> {
    const user = await this.userModel.findById(id);
    if (!user) {
      throw new NotFoundException('User not found');
    }

    // Verify current password
    const isCurrentPasswordValid = await bcrypt.compare(
      changePasswordDto.currentPassword,
      user.password,
    );

    if (!isCurrentPasswordValid) {
      throw new BadRequestException('Current password is incorrect');
    }

    // Hash new password
    const hashedNewPassword = await bcrypt.hash(
      changePasswordDto.newPassword,
      10,
    );

    // Update password
    await this.userModel.findByIdAndUpdate(id, { password: hashedNewPassword });
    // Generate new token after password change
    const payload = { sub: user._id, role: user.role };
    const newAccessToken = this.jwtService.sign(payload);

    return {
      message: 'Password changed successfully',
      access_token: newAccessToken, // ✅ New token
    };
  }

  async updateInterests(
    id: string,
    updateInterestsDto: UpdateInterestsDto,
  ): Promise<User> {
    const user = await this.userModel.findById(id);
    if (!user) {
      throw new NotFoundException('User not found');
    }

    const updatedUser = await this.userModel
      .findByIdAndUpdate(
        id,
        { interests: updateInterestsDto.interests },
        { new: true },
      )
      .populate('interests', 'name icon')
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
  // ========== INTEREST METHODS ==========
  async getAvailableInterests() {
    return this.interestModel
      .find({ isActive: true })
      .select('name icon')
      .sort({ name: 1 });
  }

  async selectInterests(
    userId: string,
    selectInterestsDto: SelectInterestsDto,
  ) {
    const { interestIds } = selectInterestsDto;

    // Validate that all interest IDs exist and are active
    const validInterests = await this.interestModel.find({
      _id: { $in: interestIds.map((id) => new Types.ObjectId(id)) },
      isActive: true,
    });

    if (validInterests.length !== interestIds.length) {
      throw new BadRequestException(
        'One or more invalid interest IDs provided',
      );
    }

    // Get user's current interests to update counters
    const user = await this.userModel.findById(userId).populate('interests');
    if (!user) {
      throw new NotFoundException('User not found');
    }

    const currentInterestIds = user.interests.map((interest) =>
      interest.toString(),
    );
    const newInterestIds = interestIds.map((id) => new Types.ObjectId(id));

    // Update interest counters
    // Decrease count for removed interests
    const removedInterests = currentInterestIds.filter(
      (id) => !interestIds.includes(id),
    );
    if (removedInterests.length > 0) {
      await this.interestModel.updateMany(
        { _id: { $in: removedInterests } },
        { $inc: { userCount: -1 } },
      );
    }

    // Increase count for new interests
    const addedInterests = interestIds.filter(
      (id) => !currentInterestIds.includes(id),
    );
    if (addedInterests.length > 0) {
      await this.interestModel.updateMany(
        { _id: { $in: addedInterests } },
        { $inc: { userCount: 1 } },
      );
    }

    // Update user's interests
    const updatedUser = await this.userModel
      .findByIdAndUpdate(
        userId,
        {
          interests: newInterestIds,
        },
        { new: true },
      )
      .populate('interests', 'name icon');

    if (!updatedUser) {
      throw new NotFoundException('User not found');
    }

    return {
      message: 'Interests updated successfully',
      selectedInterests: updatedUser.interests,
    };
  }

  // ========== USER STATS METHODS ==========
  async getUserStats(userId: string) {
    const user = await this.userModel
      .findById(userId)
      .select('-password')
      .exec();
    if (!user) {
      throw new NotFoundException('User not found');
    }

    // TODO: Add actual stats calculation when progress tracking is implemented
    return {
      currentStreak: user.currentStreak,
      lastActivityDate: user.lastActivityDate,
      isPaid: user.isPaid,
      subscriptionExpiry: user.subscriptionExpiry,
      totalLessonsCompleted: 0, // Placeholder
      totalCoursesEnrolled: 0, // Placeholder
      averageScore: 0, // Placeholder
    };
  }
}

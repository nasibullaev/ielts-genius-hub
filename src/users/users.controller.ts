// src/users/users.controller.ts
import {
  Controller,
  Get,
  Put,
  Post,
  Body,
  UseGuards,
  Request,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiProperty,
  ApiBody,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { UsersService } from './users.service';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { ChangePasswordDto } from './dto/change-password.dto';
import { UpdateInterestsDto } from './dto/update-interests.dto';
import { SelectInterestsDto } from './dto/select-interests.dto';

// Response DTOs for documentation
export class InterestResponseDto {
  @ApiProperty({ example: '68bbf88787a1e5dce79068d5' })
  _id: string;

  @ApiProperty({ example: 'IELTS Speaking' })
  name: string;

  @ApiProperty({ example: '/uploads/icons/speaking.svg' })
  icon: string;
}

export class ProfileResponseDto {
  @ApiProperty({ example: '64f8a1234567890abcdef123' })
  _id: string;

  @ApiProperty({ example: 'John Doe' })
  name: string;

  @ApiProperty({ example: 'john@example.com' })
  email: string;

  @ApiProperty({ example: '+998901234567' })
  phone: string;

  @ApiProperty({ example: 'student' })
  role: string;

  @ApiProperty({ example: false })
  isPaid: boolean;

  @ApiProperty({ example: '2024-12-31T23:59:59.000Z', required: false })
  subscriptionExpiry?: Date;

  @ApiProperty({ example: 5 })
  currentStreak: number;

  @ApiProperty({ example: '2024-01-20T15:45:00.000Z', required: false })
  lastActivityDate?: Date;

  @ApiProperty({
    type: [InterestResponseDto],
    example: [
      {
        _id: '68bbf88787a1e5dce79068d5',
        name: 'IELTS Speaking',
        icon: '/uploads/icons/speaking.svg',
      },
    ],
  })
  interests: InterestResponseDto[];

  @ApiProperty({ example: '2024-01-15T10:30:00.000Z' })
  createdAt: string;

  @ApiProperty({ example: '2024-01-20T15:45:00.000Z' })
  updatedAt: string;
}

export class PasswordChangeResponseDto {
  @ApiProperty({ example: 'Password changed successfully' })
  message: string;
}

@ApiTags('users')
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get('profile')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Get current user profile',
    description: 'Retrieves the profile of the currently authenticated user',
  })
  @ApiResponse({
    status: 200,
    description: 'Profile retrieved successfully',
    type: ProfileResponseDto,
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - Invalid or missing JWT token',
  })
  async getProfile(@Request() req) {
    return this.usersService.findByIdWithInterests(req.user.sub);
  }

  @Put('profile')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Update user profile',
    description:
      'Updates the profile of the currently authenticated user. Send only the fields you want to update.',
  })
  @ApiResponse({
    status: 200,
    description: 'Profile updated successfully',
    type: ProfileResponseDto,
  })
  @ApiResponse({ status: 400, description: 'Validation error' })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - Invalid or missing JWT token',
  })
  @ApiResponse({
    status: 409,
    description: 'Email or phone number already in use',
  })
  async updateProfile(
    @Request() req,
    @Body() updateProfileDto: UpdateProfileDto,
  ) {
    return this.usersService.updateProfile(req.user.sub, updateProfileDto);
  }

  @Put('change-password')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Change user password',
    description:
      'Changes the password of the currently authenticated user. Requires current password for verification.',
  })
  @ApiBody({
    type: ChangePasswordDto,
    description: 'Current and new password',
    examples: {
      'change-password': {
        summary: 'Change Password Example',
        value: {
          currentPassword: 'OldPassw0rd!',
          newPassword: 'NewPassw0rd!',
        },
      },
    },
  })
  @ApiResponse({
    status: 200,
    description: 'Password changed successfully',
    schema: {
      type: 'object',
      properties: {
        message: {
          type: 'string',
          example: 'Password changed successfully',
        },
      },
    },
  })
  @ApiResponse({
    status: 400,
    description: 'Invalid current password or validation error',
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - Invalid or missing JWT token',
  })
  @ApiResponse({ status: 404, description: 'User not found' })
  async changePassword(
    @Request() req,
    @Body() changePasswordDto: ChangePasswordDto,
  ) {
    return this.usersService.changePassword(req.user.sub, changePasswordDto);
  }

  // ========== INTEREST ENDPOINTS ==========
  @Get('interests/available')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Get available interests',
    description: 'Gets all active interests that users can select from',
  })
  @ApiResponse({
    status: 200,
    description: 'Available interests retrieved',
    schema: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          _id: { type: 'string' },
          name: { type: 'string', example: 'IELTS Speaking' },
          icon: { type: 'string', example: '/uploads/icons/speaking.svg' },
        },
      },
    },
  })
  async getAvailableInterests() {
    return this.usersService.getAvailableInterests();
  }

  @Post('interests/select')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Select user interests',
    description:
      'Allows user to select up to 3 interests. This should be done after login if interests array is empty.',
  })
  @ApiResponse({
    status: 200,
    description: 'Interests selected successfully',
    schema: {
      type: 'object',
      properties: {
        message: { type: 'string', example: 'Interests updated successfully' },
        selectedInterests: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              _id: { type: 'string' },
              name: { type: 'string' },
              icon: { type: 'string' },
            },
          },
        },
      },
    },
  })
  @ApiResponse({ status: 400, description: 'Invalid interest selection' })
  async selectInterests(
    @Request() req,
    @Body() selectInterestsDto: SelectInterestsDto,
  ) {
    return this.usersService.selectInterests(req.user.sub, selectInterestsDto);
  }

  @Put('interests')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Update user interests',
    description:
      'Updates the interests of the currently authenticated user. Maximum 3 interests allowed.',
  })
  @ApiResponse({
    status: 200,
    description: 'Interests updated successfully',
    schema: {
      type: 'object',
      properties: {
        _id: { type: 'string', example: '64f8a1234567890abcdef123' },
        name: { type: 'string', example: 'John Doe' },
        email: { type: 'string', example: 'john@example.com' },
        interests: {
          type: 'array',
          items: { $ref: '#/components/schemas/InterestResponseDto' },
        },
      },
    },
  })
  @ApiResponse({
    status: 400,
    description: 'Validation error - maximum 3 interests allowed',
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - Invalid or missing JWT token',
  })
  @ApiResponse({ status: 404, description: 'User not found' })
  async updateInterests(
    @Request() req,
    @Body() updateInterestsDto: UpdateInterestsDto,
  ) {
    return this.usersService.updateInterests(req.user.sub, updateInterestsDto);
  }

  // ========== USER STATS ENDPOINTS ==========
  @Get('stats')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Get user statistics and activity',
    description:
      'Retrieves user statistics including streak, activity, and progress data',
  })
  @ApiResponse({
    status: 200,
    description: 'User statistics retrieved successfully',
    schema: {
      type: 'object',
      properties: {
        currentStreak: { type: 'number', example: 5 },
        lastActivityDate: {
          type: 'string',
          example: '2024-01-20T15:45:00.000Z',
        },
        isPaid: { type: 'boolean', example: false },
        subscriptionExpiry: {
          type: 'string',
          example: '2024-12-31T23:59:59.000Z',
        },
        totalLessonsCompleted: { type: 'number', example: 12 },
        totalCoursesEnrolled: { type: 'number', example: 3 },
        averageScore: { type: 'number', example: 85.5 },
      },
    },
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - Invalid or missing JWT token',
  })
  async getUserStats(@Request() req) {
    return this.usersService.getUserStats(req.user.sub);
  }
}

import {
  Controller,
  Get,
  Param,
  UseGuards,
  Request,
  ForbiddenException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { Model } from 'mongoose';
import { Lesson } from '../lessons/schemas/lesson.schema';
import { User } from '../users/schemas/user.schema';

@ApiTags('sections')
@Controller('sections')
export class SectionsController {
  constructor(
    @InjectModel(Lesson.name) private lessonModel: Model<Lesson>,
    @InjectModel(User.name) private userModel: Model<User>,
  ) {}

  @Get(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Get all lessons within a section (Paid users only)',
  })
  @ApiResponse({ status: 200, description: 'Lessons retrieved successfully' })
  @ApiResponse({ status: 403, description: 'Payment required' })
  async getSectionLessons(@Param('id') id: string, @Request() req) {
    const user = await this.userModel.findById(req.user.sub).select('isPaid');
    if (!user?.isPaid) {
      throw new ForbiddenException('Payment required to access lessons');
    }

    return this.lessonModel
      .find({ sectionId: id })
      .sort({ order: 1 })
      .lean()
      .exec();
  }
}

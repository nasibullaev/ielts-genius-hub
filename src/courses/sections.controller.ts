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
import { Section } from './schemas/section.schema';
import { Task } from '../lessons/schemas/task.schema';
import { User } from '../users/schemas/user.schema';

@ApiTags('sections')
@Controller('sections')
export class SectionsController {
  constructor(
    @InjectModel(Section.name) private sectionModel: Model<Section>,
    @InjectModel(Task.name) private taskModel: Model<Task>,
    @InjectModel(User.name) private userModel: Model<User>,
  ) {}

  @Get(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Get a session (section) with its tasks (Paid users only)',
  })
  @ApiResponse({ status: 200, description: 'Section with tasks retrieved' })
  @ApiResponse({ status: 403, description: 'Payment required' })
  async getSectionLessons(@Param('id') id: string, @Request() req) {
    const user = await this.userModel.findById(req.user.sub).select('isPaid');
    if (!user?.isPaid) {
      throw new ForbiddenException('Payment required to access content');
    }

    const section = await this.sectionModel.findById(id).lean().exec();
    if (!section) {
      return [];
    }

    const tasks = await this.taskModel
      .find({ sectionId: id })
      .select(
        '-correctOptionIndex -correctOptionIndices -correctPairs -correctOrder -correctAnswers -correctFlags -correctMapping -modelAnswer',
      )
      .sort({ order: 1 })
      .lean()
      .exec();

    return { ...section, tasks };
  }
}

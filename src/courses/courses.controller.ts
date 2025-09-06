import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  UseGuards,
  Request,
  UseInterceptors,
  UploadedFile,
  BadRequestException,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiProperty,
  ApiConsumes,
  ApiBody,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { AdminGuard } from '../auth/admin.guard';
import { CoursesService } from './courses.service';
import { CreateCourseDto } from './dto/create-course.dto';
import { RateCourseDto } from './dto/rate-course.dto';
import { multerConfig } from '../common/config/multer.config';

@ApiTags('courses')
@Controller('courses')
export class CoursesController {
  constructor(private readonly coursesService: CoursesService) {}

  @Get()
  @ApiOperation({
    summary: 'Get all courses',
    description:
      'Retrieves all available courses with user progress if authenticated. Public endpoint.',
  })
  @ApiResponse({
    status: 200,
    description: 'Courses retrieved successfully',
    schema: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          _id: { type: 'string' },
          title: { type: 'string', example: 'IELTS Speaking Mastery' },
          description: {
            type: 'string',
            example: 'Complete IELTS Speaking preparation',
          },
          duration: { type: 'string', example: '15 hours' },
          level: { type: 'string', example: 'Intermediate' },
          rating: { type: 'number', example: 4.5 },
          totalLessons: { type: 'number', example: 25 },
          picture: {
            type: 'string',
            example: '/uploads/courses/course-123.jpg',
          },
          userProgress: {
            type: 'object',
            description: 'Only present if user is authenticated',
          },
        },
      },
    },
  })
  async findAll(@Request() req) {
    const userId = req.user?.sub;
    return this.coursesService.findAll(userId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get course details' })
  @ApiResponse({ status: 200, description: 'Course details retrieved' })
  @ApiResponse({ status: 404, description: 'Course not found' })
  async findOne(@Param('id') id: string, @Request() req) {
    const userId = req.user?.sub;
    return this.coursesService.findOne(id, userId);
  }

  @Post()
  @UseGuards(JwtAuthGuard, AdminGuard)
  @UseInterceptors(FileInterceptor('picture', multerConfig))
  @ApiBearerAuth()
  @ApiConsumes('multipart/form-data')
  @ApiOperation({ summary: 'Create new course with image upload (Admin only)' })
  @ApiBody({
    description: 'Course data with image file',
    schema: {
      type: 'object',
      properties: {
        title: { type: 'string', example: 'IELTS Speaking Mastery' },
        description: {
          type: 'string',
          example: 'Complete IELTS Speaking preparation',
        },
        duration: { type: 'string', example: '15 hours' },
        level: {
          type: 'string',
          enum: ['Beginner', 'Intermediate', 'Advanced'],
        },
        picture: {
          type: 'string',
          format: 'binary',
          description: 'Course image file (JPEG, PNG, WebP, max 5MB)',
        },
      },
    },
  })
  @ApiResponse({ status: 201, description: 'Course created successfully' })
  @ApiResponse({ status: 403, description: 'Admin access required' })
  @ApiResponse({ status: 400, description: 'Invalid file or validation error' })
  // src/courses/courses.controller.ts - Update the create method:
  async create(
    @Body() createCourseDto: CreateCourseDto,
    @UploadedFile() picture: Express.Multer.File,
  ) {
    if (!picture) {
      throw new BadRequestException('Course picture is required');
    }

    const pictureUrl = `/uploads/courses/${picture.filename}`;

    // ✅ Pass data separately
    return this.coursesService.create(createCourseDto, pictureUrl);
  }

  @Put(':id')
  @UseGuards(JwtAuthGuard, AdminGuard)
  @UseInterceptors(FileInterceptor('picture', multerConfig))
  @ApiBearerAuth()
  @ApiConsumes('multipart/form-data')
  @ApiOperation({ summary: 'Update course (Admin only)' })
  @ApiBody({
    description: 'Course update data with optional image file',
    schema: {
      type: 'object',
      properties: {
        title: { type: 'string' },
        description: { type: 'string' },
        duration: { type: 'string' },
        level: {
          type: 'string',
          enum: ['Beginner', 'Intermediate', 'Advanced'],
        },
        picture: {
          type: 'string',
          format: 'binary',
          description: 'New course image (optional)',
        },
      },
    },
  })
  @ApiResponse({ status: 200, description: 'Course updated successfully' })
  async update(
    @Param('id') id: string,
    @Body() updateDto: Partial<CreateCourseDto>,
    @UploadedFile() picture?: Express.Multer.File,
  ) {
    const updateData: any = { ...updateDto }; // ✅ Cast to any

    if (picture) {
      updateData.picture = `/uploads/courses/${picture.filename}`;
    }

    return this.coursesService.update(id, updateData);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, AdminGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Delete course (Admin only)' })
  @ApiResponse({ status: 200, description: 'Course deleted successfully' })
  async remove(@Param('id') id: string) {
    return this.coursesService.remove(id);
  }

  @Post(':id/rate')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Rate a course (Paid users only)' })
  @ApiResponse({ status: 200, description: 'Course rated successfully' })
  @ApiResponse({ status: 403, description: 'Payment required' })
  async rateCourse(
    @Param('id') id: string,
    @Request() req,
    @Body() rateDto: RateCourseDto,
  ) {
    return this.coursesService.rateCourse(req.user.sub, id, rateDto);
  }
}

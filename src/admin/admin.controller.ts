import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  UseGuards,
  Query,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiProperty,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { AdminGuard } from '../auth/admin.guard';
import { AdminService } from './admin.service';
import { CreateUnitDto, UpdateUnitDto } from './dto/create-unit.dto';
import { CreateSectionDto, UpdateSectionDto } from './dto/create-section.dto';
import { CreateLessonDto, UpdateLessonDto } from './dto/create-lesson.dto';
import {
  CreateQuizQuestionDto,
  UpdateQuizQuestionDto,
} from './dto/create-quiz-question.dto';
import { CreateBulkQuestionsDto } from './dto/bulk-quiz-questions.dto';

export class DashboardStatsDto {
  @ApiProperty({ example: 1250 })
  totalUsers: number;

  @ApiProperty({ example: 450 })
  monthlyActiveUsers: number;

  @ApiProperty({ example: 85 })
  dailyActiveUsers: number;

  @ApiProperty({
    example: [
      {
        userId: '64f8a1234567890abcdef123',
        userName: 'John Doe',
        activityType: 'quiz_attempted',
        lessonTitle: 'IELTS Speaking Part 1',
        score: 85,
        createdAt: '2024-08-31T10:30:00.000Z',
      },
    ],
  })
  recentActivities: object[];

  @ApiProperty({
    example: [
      {
        courseId: '64f8a1234567890abcdef123',
        title: 'IELTS Speaking Mastery',
        averageRating: 4.5,
        totalRatings: 120,
        enrolledUsers: 350,
      },
    ],
  })
  courseStats: object[];
}

@ApiTags('admin')
@Controller('admin')
export class AdminController {
  constructor(private readonly adminService: AdminService) {}

  @Get('dashboard')
  @UseGuards(JwtAuthGuard, AdminGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get admin dashboard statistics' })
  @ApiResponse({
    status: 200,
    description: 'Dashboard stats retrieved successfully',
    type: DashboardStatsDto,
  })
  @ApiResponse({ status: 403, description: 'Admin access required' })
  async getDashboardStats() {
    return this.adminService.getDashboardStats();
  }

  @Post('units')
  @UseGuards(JwtAuthGuard, AdminGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create unit in course' })
  async createUnit(@Body() createUnitDto: CreateUnitDto) {
    return this.adminService.createUnit(createUnitDto);
  }

  @Put('units/:id')
  @UseGuards(JwtAuthGuard, AdminGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update unit' })
  async updateUnit(
    @Param('id') id: string,
    @Body() updateUnitDto: UpdateUnitDto,
  ) {
    return this.adminService.updateUnit(id, updateUnitDto);
  }

  @Delete('units/:id')
  @UseGuards(JwtAuthGuard, AdminGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Delete unit' })
  async deleteUnit(@Param('id') id: string) {
    return this.adminService.deleteUnit(id);
  }

  @Get('courses/:courseId/units')
  @UseGuards(JwtAuthGuard, AdminGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get all units in a course' })
  async getUnitsInCourse(@Param('courseId') courseId: string) {
    return this.adminService.getUnitsInCourse(courseId);
  }

  @Post('sections')
  @UseGuards(JwtAuthGuard, AdminGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create section in unit' })
  async createSection(@Body() createSectionDto: CreateSectionDto) {
    return this.adminService.createSection(createSectionDto);
  }

  @Put('sections/:id')
  @UseGuards(JwtAuthGuard, AdminGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update section' })
  async updateSection(
    @Param('id') id: string,
    @Body() updateSectionDto: UpdateSectionDto,
  ) {
    return this.adminService.updateSection(id, updateSectionDto);
  }

  @Delete('sections/:id')
  @UseGuards(JwtAuthGuard, AdminGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Delete section' })
  async deleteSection(@Param('id') id: string) {
    return this.adminService.deleteSection(id);
  }

  @Get('units/:unitId/sections')
  @UseGuards(JwtAuthGuard, AdminGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get all sections in a unit' })
  async getSectionsInUnit(@Param('unitId') unitId: string) {
    return this.adminService.getSectionsInUnit(unitId);
  }

  @Post('lessons')
  @UseGuards(JwtAuthGuard, AdminGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create lesson in section' })
  async createLesson(@Body() createLessonDto: CreateLessonDto) {
    return this.adminService.createLesson(createLessonDto);
  }

  @Put('lessons/:id')
  @UseGuards(JwtAuthGuard, AdminGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update lesson' })
  async updateLesson(
    @Param('id') id: string,
    @Body() updateLessonDto: UpdateLessonDto,
  ) {
    return this.adminService.updateLesson(id, updateLessonDto);
  }

  @Delete('lessons/:id')
  @UseGuards(JwtAuthGuard, AdminGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Delete lesson' })
  async deleteLesson(@Param('id') id: string) {
    return this.adminService.deleteLesson(id);
  }

  @Get('sections/:sectionId/lessons')
  @UseGuards(JwtAuthGuard, AdminGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get all lessons in a section' })
  async getLessonsInSection(@Param('sectionId') sectionId: string) {
    return this.adminService.getLessonsInSection(sectionId);
  }

  @Post('lessons/:lessonId/questions')
  @UseGuards(JwtAuthGuard, AdminGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Add question to quiz lesson' })
  async addQuizQuestion(
    @Param('lessonId') lessonId: string,
    @Body() questionDto: CreateQuizQuestionDto,
  ) {
    return this.adminService.addQuizQuestion(lessonId, questionDto);
  }
  @Post('lessons/:lessonId/questions/bulk')
  @UseGuards(JwtAuthGuard, AdminGuard)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Add multiple questions to quiz lesson at once',
    description:
      'Bulk create up to 50 questions for a quiz lesson. Automatically handles order numbering.',
  })
  @ApiResponse({
    status: 201,
    description: 'Questions created successfully',
    schema: {
      type: 'object',
      properties: {
        message: {
          type: 'string',
          example: 'Created 5 questions successfully',
        },
        createdCount: { type: 'number', example: 5 },
        questions: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              _id: { type: 'string' },
              question: { type: 'string' },
              order: { type: 'number' },
            },
          },
        },
      },
    },
  })
  @ApiResponse({ status: 400, description: 'Validation error' })
  @ApiResponse({ status: 404, description: 'Lesson not found' })
  async addBulkQuizQuestions(
    @Param('lessonId') lessonId: string,
    @Body() bulkQuestionsDto: CreateBulkQuestionsDto,
  ) {
    return this.adminService.addBulkQuizQuestions(lessonId, bulkQuestionsDto);
  }

  @Put('questions/:id')
  @UseGuards(JwtAuthGuard, AdminGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update quiz question' })
  async updateQuizQuestion(
    @Param('id') id: string,
    @Body() questionDto: UpdateQuizQuestionDto,
  ) {
    return this.adminService.updateQuizQuestion(id, questionDto);
  }

  @Delete('questions/:id')
  @UseGuards(JwtAuthGuard, AdminGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Delete quiz question' })
  async deleteQuizQuestion(@Param('id') id: string) {
    return this.adminService.deleteQuizQuestion(id);
  }

  @Get('lessons/:lessonId/questions')
  @UseGuards(JwtAuthGuard, AdminGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get all questions in quiz lesson' })
  async getQuizQuestions(@Param('lessonId') lessonId: string) {
    return this.adminService.getQuizQuestions(lessonId);
  }
}

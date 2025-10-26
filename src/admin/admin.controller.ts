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
  UseInterceptors,
  UploadedFile,
  UploadedFiles,
  BadRequestException,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiProperty,
  ApiConsumes,
  ApiBody,
} from '@nestjs/swagger';
import { FileInterceptor, FilesInterceptor } from '@nestjs/platform-express';
import { interestMulterConfig } from '../common/config/interest-multer.config';
import {
  taskImageMulterConfig,
  taskAudioMulterConfig,
} from '../common/config/task-multer.config';
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
import {
  CreateInterestDto,
  UpdateInterestDto,
} from './dto/create-interest.dto';
import { CreateTaskDto, UpdateTaskDto } from './dto/create-task.dto';
import { TaskType } from '../lessons/schemas/task.schema';

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

  // ========== INTEREST MANAGEMENT ==========
  @Post('interests')
  @UseGuards(JwtAuthGuard, AdminGuard)
  @UseInterceptors(FileInterceptor('icon', interestMulterConfig))
  @ApiBearerAuth()
  @ApiConsumes('multipart/form-data')
  @ApiOperation({ summary: 'Create new interest topic with icon upload' })
  @ApiBody({
    description: 'Interest data with icon file',
    schema: {
      type: 'object',
      properties: {
        name: { type: 'string', example: 'IELTS Speaking' },
        isActive: {
          type: 'string',
          example: 'true',
          description: 'Boolean as string: "true", "false", "1", or "0"',
        },
        icon: {
          type: 'string',
          format: 'binary',
          description: 'SVG icon file (max 1MB)',
        },
      },
      required: ['name', 'icon'],
    },
  })
  @ApiResponse({
    status: 201,
    description: 'Interest created successfully',
    schema: {
      type: 'object',
      properties: {
        _id: { type: 'string' },
        name: { type: 'string', example: 'IELTS Speaking' },
        icon: {
          type: 'string',
          example: '/uploads/icons/interest-1693492800.svg',
        },
        isActive: { type: 'boolean', example: true },
        userCount: { type: 'number', example: 0 },
        createdAt: { type: 'string' },
        updatedAt: { type: 'string' },
      },
    },
  })
  @ApiResponse({ status: 400, description: 'Invalid file or validation error' })
  async createInterest(
    @Body() createInterestDto: CreateInterestDto,
    @UploadedFile() icon: Express.Multer.File,
  ) {
    if (!icon) {
      throw new BadRequestException('Interest icon is required');
    }

    const iconUrl = `/uploads/icons/${icon.filename}`;
    return this.adminService.createInterest(createInterestDto, iconUrl);
  }

  @Get('interests')
  @UseGuards(JwtAuthGuard, AdminGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get all interests (admin view with stats)' })
  @ApiResponse({
    status: 200,
    description: 'All interests retrieved',
    schema: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          _id: { type: 'string' },
          name: { type: 'string' },
          icon: { type: 'string' },
          isActive: { type: 'boolean' },
          userCount: { type: 'number' },
          createdAt: { type: 'string' },
          updatedAt: { type: 'string' },
        },
      },
    },
  })
  async getAllInterests() {
    return this.adminService.getAllInterests();
  }

  @Put('interests/:id')
  @UseGuards(JwtAuthGuard, AdminGuard)
  @UseInterceptors(FileInterceptor('icon', interestMulterConfig))
  @ApiBearerAuth()
  @ApiConsumes('multipart/form-data')
  @ApiOperation({ summary: 'Update interest with optional icon upload' })
  @ApiBody({
    description: 'Interest update data with optional icon file',
    schema: {
      type: 'object',
      properties: {
        name: { type: 'string', example: 'IELTS Speaking Updated' },
        isActive: {
          type: 'string',
          example: 'true',
          description: 'Boolean as string: "true", "false", "1", or "0"',
        },
        icon: {
          type: 'string',
          format: 'binary',
          description: 'New SVG icon file (optional, max 1MB)',
        },
      },
    },
  })
  @ApiResponse({ status: 200, description: 'Interest updated successfully' })
  @ApiResponse({ status: 400, description: 'Invalid file or validation error' })
  @ApiResponse({ status: 404, description: 'Interest not found' })
  async updateInterest(
    @Param('id') id: string,
    @Body() updateInterestDto: UpdateInterestDto,
    @UploadedFile() icon?: Express.Multer.File,
  ) {
    let iconUrl: string | undefined;

    if (icon) {
      iconUrl = `/uploads/icons/${icon.filename}`;
    }

    return this.adminService.updateInterest(id, updateInterestDto, iconUrl);
  }

  @Delete('interests/:id')
  @UseGuards(JwtAuthGuard, AdminGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Delete interest' })
  @ApiResponse({ status: 200, description: 'Interest deleted successfully' })
  @ApiResponse({
    status: 400,
    description: 'Cannot delete interest with users',
  })
  @ApiResponse({ status: 404, description: 'Interest not found' })
  async deleteInterest(@Param('id') id: string) {
    return this.adminService.deleteInterest(id);
  }

  // ========== TASK MANAGEMENT ==========

  // Lead-in Task
  @Post('tasks/lead-in')
  @UseGuards(JwtAuthGuard, AdminGuard)
  @UseInterceptors(
    FilesInterceptor('files', 2, {
      storage: taskImageMulterConfig.storage,
      fileFilter: (req, file, callback) => {
        if (file.mimetype.startsWith('image/')) {
          taskImageMulterConfig.fileFilter(req, file, callback);
        } else {
          callback(
            new BadRequestException(
              'Only image files are allowed for Lead-in tasks',
            ),
            false,
          );
        }
      },
      limits: { fileSize: 5 * 1024 * 1024 },
    }),
  )
  @ApiBearerAuth()
  @ApiConsumes('multipart/form-data')
  @ApiOperation({ summary: 'Create Lead-in task' })
  @ApiBody({
    description: 'Lead-in task data - Warm-up activity or discussion prompt',
    schema: {
      type: 'object',
      required: ['lessonId', 'order'],
      properties: {
        files: {
          type: 'array',
          items: { type: 'string', format: 'binary' },
          description: 'Optional image files (JPEG, PNG, WebP, max 5MB)',
        },
        lessonId: { type: 'string', example: '64f8c1234567890abcdef789' },
        order: { type: 'number', example: 1 },
        title: { type: 'string', example: 'Warm-up Discussion' },
        description: {
          type: 'string',
          example: 'Get students thinking about the topic',
        },
        textPrompt: {
          type: 'string',
          example: 'What comes to mind when you hear "IELTS"?',
        },
        imageUrl: { type: 'string', example: '/uploads/tasks/image.jpg' },
      },
    },
  })
  @ApiResponse({ status: 201, description: 'Task created successfully' })
  async createLeadInTask(
    @UploadedFiles() files: Express.Multer.File[],
    @Body() body: any,
  ) {
    const { files: _files, ...taskData } = body;
    const createTaskDto: CreateTaskDto = {
      lessonId: taskData.lessonId,
      type: TaskType.LEAD_IN,
      order: parseInt(taskData.order),
      title: taskData.title,
      description: taskData.description,
      textPrompt: taskData.textPrompt,
    };

    if (files?.length > 0) {
      createTaskDto.imageUrl = `/uploads/tasks/${files[0].filename}`;
    }

    return this.adminService.createTask(createTaskDto);
  }

  // Listening MCQ Task
  @Post('tasks/listening-mcq')
  @UseGuards(JwtAuthGuard, AdminGuard)
  @UseInterceptors(
    FilesInterceptor('files', 1, {
      storage: taskAudioMulterConfig.storage,
      fileFilter: (req, file, callback) => {
        if (file.mimetype.startsWith('audio/')) {
          taskAudioMulterConfig.fileFilter(req, file, callback);
        } else {
          callback(
            new BadRequestException(
              'Only audio files are allowed for Listening tasks',
            ),
            false,
          );
        }
      },
      limits: { fileSize: 10 * 1024 * 1024 },
    }),
  )
  @ApiBearerAuth()
  @ApiConsumes('multipart/form-data')
  @ApiOperation({ summary: 'Create Listening (Audio + MCQ) task' })
  @ApiBody({
    description: 'Listening MCQ task data - Play audio and choose answer',
    schema: {
      type: 'object',
      required: ['lessonId', 'order', 'options', 'correctOptionIndex'],
      properties: {
        files: {
          type: 'array',
          items: { type: 'string', format: 'binary' },
          description: 'Audio file (MP3, WAV, OGG, WebM, max 10MB)',
        },
        lessonId: { type: 'string', example: '64f8c1234567890abcdef789' },
        order: { type: 'number', example: 1 },
        title: { type: 'string', example: 'Listen and Answer' },
        description: {
          type: 'string',
          example: 'Listen to the audio and choose the correct answer',
        },
        audioUrl: { type: 'string', example: '/uploads/tasks/audio.mp3' },
        options: {
          type: 'array',
          items: { type: 'string' },
          example: ['Option A', 'Option B', 'Option C', 'Option D'],
        },
        correctOptionIndex: { type: 'number', example: 2 },
      },
    },
  })
  @ApiResponse({ status: 201, description: 'Task created successfully' })
  async createListeningMcqTask(
    @UploadedFiles() files: Express.Multer.File[],
    @Body() body: any,
  ) {
    const { files: _files, ...taskData } = body;
    const createTaskDto: CreateTaskDto = {
      lessonId: taskData.lessonId,
      type: TaskType.LISTENING_MCQ,
      order: parseInt(taskData.order),
      title: taskData.title,
      description: taskData.description,
      options: taskData.options,
      correctOptionIndex: parseInt(taskData.correctOptionIndex),
    };

    if (files?.length > 0) {
      createTaskDto.audioUrl = `/uploads/tasks/${files[0].filename}`;
    }

    return this.adminService.createTask(createTaskDto);
  }

  // Recording Task
  @Post('tasks/recording')
  @UseGuards(JwtAuthGuard, AdminGuard)
  @ApiBearerAuth()
  @ApiConsumes('multipart/form-data')
  @ApiOperation({ summary: 'Create Recording (Speaking Prompt) task' })
  @ApiBody({
    description: 'Display question; learner records answer',
    schema: {
      type: 'object',
      required: ['lessonId', 'order', 'promptText'],
      properties: {
        lessonId: { type: 'string' },
        order: { type: 'number' },
        title: { type: 'string' },
        description: { type: 'string' },
        promptText: { type: 'string' },
        maxDuration: { type: 'number' },
        sampleAnswerAudioUrl: { type: 'string' },
      },
    },
  })
  @ApiResponse({ status: 201 })
  async createRecordingTask(@Body() body: CreateTaskDto) {
    return this.adminService.createTask({ ...body, type: TaskType.RECORDING });
  }

  // Matching Task
  @Post('tasks/matching')
  @UseGuards(JwtAuthGuard, AdminGuard)
  @ApiBearerAuth()
  @ApiConsumes('multipart/form-data')
  @ApiOperation({ summary: 'Create Matching task' })
  @ApiBody({
    description: 'Match phrases, words, or meanings',
    schema: {
      type: 'object',
      required: ['lessonId', 'order', 'pairs', 'correctPairs'],
      properties: {
        lessonId: { type: 'string' },
        order: { type: 'number' },
        title: { type: 'string' },
        description: { type: 'string' },
        pairs: {
          type: 'array',
          items: {
            type: 'object',
            properties: { left: { type: 'string' }, right: { type: 'string' } },
          },
        },
        correctPairs: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              leftIndex: { type: 'number' },
              rightIndex: { type: 'number' },
            },
          },
        },
      },
    },
  })
  @ApiResponse({ status: 201 })
  async createMatchingTask(@Body() body: CreateTaskDto) {
    return this.adminService.createTask({ ...body, type: TaskType.MATCHING });
  }

  // Ranking Task
  @Post('tasks/ranking')
  @UseGuards(JwtAuthGuard, AdminGuard)
  @ApiBearerAuth()
  @ApiConsumes('multipart/form-data')
  @ApiOperation({ summary: 'Create Ranking task' })
  @ApiBody({
    description: 'Rank items by frequency, importance, etc.',
    schema: {
      type: 'object',
      required: ['lessonId', 'order', 'items', 'correctOrder'],
      properties: {
        lessonId: { type: 'string' },
        order: { type: 'number' },
        title: { type: 'string' },
        description: { type: 'string' },
        items: { type: 'array', items: { type: 'string' } },
        correctOrder: { type: 'array', items: { type: 'number' } },
      },
    },
  })
  @ApiResponse({ status: 201 })
  async createRankingTask(@Body() body: CreateTaskDto) {
    return this.adminService.createTask({ ...body, type: TaskType.RANKING });
  }

  // Fill-in-Blank Task
  @Post('tasks/fill-in-blank')
  @UseGuards(JwtAuthGuard, AdminGuard)
  @ApiBearerAuth()
  @ApiConsumes('multipart/form-data')
  @ApiOperation({ summary: 'Create Fill-in-the-Blank task' })
  @ApiBody({
    description: 'Complete sentences using a word bank',
    schema: {
      type: 'object',
      required: [
        'lessonId',
        'order',
        'textTemplate',
        'wordBank',
        'correctAnswers',
      ],
      properties: {
        lessonId: { type: 'string' },
        order: { type: 'number' },
        title: { type: 'string' },
        description: { type: 'string' },
        textTemplate: { type: 'string' },
        wordBank: { type: 'array', items: { type: 'string' } },
        correctAnswers: {
          type: 'object',
          additionalProperties: { type: 'string' },
        },
      },
    },
  })
  @ApiResponse({ status: 201 })
  async createFillInBlankTask(@Body() body: CreateTaskDto) {
    return this.adminService.createTask({
      ...body,
      type: TaskType.FILL_IN_BLANK,
    });
  }

  // Multiple Choice Task
  @Post('tasks/multiple-choice')
  @UseGuards(JwtAuthGuard, AdminGuard)
  @ApiBearerAuth()
  @ApiConsumes('multipart/form-data')
  @ApiOperation({ summary: 'Create Multiple Choice (Reading) task' })
  @ApiBody({
    description: 'Choose one or more correct answers',
    schema: {
      type: 'object',
      required: ['lessonId', 'order', 'options', 'correctOptionIndices'],
      properties: {
        lessonId: { type: 'string' },
        order: { type: 'number' },
        title: { type: 'string' },
        description: { type: 'string' },
        options: { type: 'array', items: { type: 'string' } },
        correctOptionIndices: { type: 'array', items: { type: 'number' } },
      },
    },
  })
  @ApiResponse({ status: 201 })
  async createMultipleChoiceTask(@Body() body: CreateTaskDto) {
    return this.adminService.createTask({
      ...body,
      type: TaskType.MULTIPLE_CHOICE,
    });
  }

  // True/False Task
  @Post('tasks/true-false')
  @UseGuards(JwtAuthGuard, AdminGuard)
  @ApiBearerAuth()
  @ApiConsumes('multipart/form-data')
  @ApiOperation({ summary: 'Create True/False task' })
  @ApiBody({
    description: 'Mark statements as true or false',
    schema: {
      type: 'object',
      required: ['lessonId', 'order', 'statements', 'correctFlags'],
      properties: {
        lessonId: { type: 'string' },
        order: { type: 'number' },
        title: { type: 'string' },
        description: { type: 'string' },
        statements: { type: 'array', items: { type: 'string' } },
        correctFlags: { type: 'array', items: { type: 'boolean' } },
      },
    },
  })
  @ApiResponse({ status: 201 })
  async createTrueFalseTask(@Body() body: CreateTaskDto) {
    return this.adminService.createTask({ ...body, type: TaskType.TRUE_FALSE });
  }

  // Summary Cloze Task
  @Post('tasks/summary-cloze')
  @UseGuards(JwtAuthGuard, AdminGuard)
  @ApiBearerAuth()
  @ApiConsumes('multipart/form-data')
  @ApiOperation({ summary: 'Create Summary (Cloze) task' })
  @ApiBody({
    description: 'Fill in missing words from summary paragraph',
    schema: {
      type: 'object',
      required: [
        'lessonId',
        'order',
        'textTemplate',
        'wordBank',
        'correctAnswers',
      ],
      properties: {
        lessonId: { type: 'string' },
        order: { type: 'number' },
        title: { type: 'string' },
        description: { type: 'string' },
        textTemplate: { type: 'string' },
        wordBank: { type: 'array', items: { type: 'string' } },
        correctAnswers: {
          type: 'object',
          additionalProperties: { type: 'string' },
        },
      },
    },
  })
  @ApiResponse({ status: 201 })
  async createSummaryClozeTask(@Body() body: CreateTaskDto) {
    return this.adminService.createTask({
      ...body,
      type: TaskType.SUMMARY_CLOZE,
    });
  }

  // Drag-Drop Task
  @Post('tasks/drag-drop')
  @UseGuards(JwtAuthGuard, AdminGuard)
  @ApiBearerAuth()
  @ApiConsumes('multipart/form-data')
  @ApiOperation({ summary: 'Create Drag-and-Drop (Categorization) task' })
  @ApiBody({
    description: 'Drag items into categories',
    schema: {
      type: 'object',
      required: ['lessonId', 'order', 'categories', 'correctMapping'],
      properties: {
        lessonId: { type: 'string' },
        order: { type: 'number' },
        title: { type: 'string' },
        description: { type: 'string' },
        categories: { type: 'array', items: { type: 'string' } },
        correctMapping: {
          type: 'object',
          additionalProperties: { type: 'array', items: { type: 'string' } },
        },
      },
    },
  })
  @ApiResponse({ status: 201 })
  async createDragDropTask(@Body() body: CreateTaskDto) {
    return this.adminService.createTask({ ...body, type: TaskType.DRAG_DROP });
  }

  // Paraphrase Task
  @Post('tasks/paraphrase')
  @UseGuards(JwtAuthGuard, AdminGuard)
  @ApiBearerAuth()
  @ApiConsumes('multipart/form-data')
  @ApiOperation({ summary: 'Create Paraphrase (Typing Input) task' })
  @ApiBody({
    description: 'Rewrite sentence in another way',
    schema: {
      type: 'object',
      required: ['lessonId', 'order', 'baseSentence'],
      properties: {
        lessonId: { type: 'string' },
        order: { type: 'number' },
        title: { type: 'string' },
        description: { type: 'string' },
        baseSentence: { type: 'string' },
        modelAnswer: { type: 'string' },
      },
    },
  })
  @ApiResponse({ status: 201 })
  async createParaphraseTask(@Body() body: CreateTaskDto) {
    return this.adminService.createTask({ ...body, type: TaskType.PARAPHRASE });
  }

  // Sentence Reordering Task
  @Post('tasks/sentence-reordering')
  @UseGuards(JwtAuthGuard, AdminGuard)
  @ApiBearerAuth()
  @ApiConsumes('multipart/form-data')
  @ApiOperation({ summary: 'Create Sentence Reordering task' })
  @ApiBody({
    description: 'Reorder phrases into correct sequence',
    schema: {
      type: 'object',
      required: ['lessonId', 'order', 'segments', 'correctOrder'],
      properties: {
        lessonId: { type: 'string' },
        order: { type: 'number' },
        title: { type: 'string' },
        description: { type: 'string' },
        segments: { type: 'array', items: { type: 'string' } },
        correctOrder: { type: 'array', items: { type: 'number' } },
      },
    },
  })
  @ApiResponse({ status: 201 })
  async createSentenceReorderingTask(@Body() body: CreateTaskDto) {
    return this.adminService.createTask({
      ...body,
      type: TaskType.SENTENCE_REORDERING,
    });
  }

  // Speaking Part 2 Cue Card Task
  @Post('tasks/speaking-part2')
  @UseGuards(JwtAuthGuard, AdminGuard)
  @ApiBearerAuth()
  @ApiConsumes('multipart/form-data')
  @ApiOperation({ summary: 'Create Speaking – Part 2 Cue Card task' })
  @ApiBody({
    description: 'Show topic card for 1–2 minute response',
    schema: {
      type: 'object',
      required: ['lessonId', 'order', 'cueCardText'],
      properties: {
        lessonId: { type: 'string' },
        order: { type: 'number' },
        title: { type: 'string' },
        description: { type: 'string' },
        cueCardText: { type: 'string' },
        notesHint: { type: 'array', items: { type: 'string' } },
        sampleAnswerAudioUrl: { type: 'string' },
      },
    },
  })
  @ApiResponse({ status: 201 })
  async createSpeakingPart2Task(@Body() body: CreateTaskDto) {
    return this.adminService.createTask({
      ...body,
      type: TaskType.SPEAKING_PART2_CUE_CARD,
    });
  }

  // Speaking Part 3 Discussion Task
  @Post('tasks/speaking-part3')
  @UseGuards(JwtAuthGuard, AdminGuard)
  @ApiBearerAuth()
  @ApiConsumes('multipart/form-data')
  @ApiOperation({ summary: 'Create Speaking – Part 3 Discussion task' })
  @ApiBody({
    description: 'Display abstract question for extended answer',
    schema: {
      type: 'object',
      required: ['lessonId', 'order', 'questionText'],
      properties: {
        lessonId: { type: 'string' },
        order: { type: 'number' },
        title: { type: 'string' },
        description: { type: 'string' },
        questionText: { type: 'string' },
        keyPoints: { type: 'array', items: { type: 'string' } },
        modelAnswer: { type: 'string' },
      },
    },
  })
  @ApiResponse({ status: 201 })
  async createSpeakingPart3Task(@Body() body: CreateTaskDto) {
    return this.adminService.createTask({
      ...body,
      type: TaskType.SPEAKING_PART3_DISCUSSION,
    });
  }

  // Main POST tasks endpoint (for backward compatibility)
  @Post('tasks')
  @UseGuards(JwtAuthGuard, AdminGuard)
  @UseInterceptors(
    FilesInterceptor('files', 3, {
      storage: taskImageMulterConfig.storage,
      fileFilter: (req, file, callback) => {
        // Allow both images and audio files
        if (file.mimetype.startsWith('image/')) {
          taskImageMulterConfig.fileFilter(req, file, callback);
        } else if (file.mimetype.startsWith('audio/')) {
          taskAudioMulterConfig.fileFilter(req, file, callback);
        } else {
          callback(
            new BadRequestException('Only image and audio files are allowed'),
            false,
          );
        }
      },
      limits: { fileSize: 10 * 1024 * 1024 }, // 10MB
    }),
  )
  @ApiBearerAuth()
  @ApiConsumes('multipart/form-data')
  @ApiOperation({
    summary: 'Create task in lesson with optional file uploads',
    description:
      'Create a task with support for image and audio file uploads. Upload up to 3 files (images or audio). Files are automatically stored and URLs are assigned to appropriate fields.',
  })
  @ApiBody({
    description:
      'Task data with optional image/audio files. Only fill fields relevant to your selected task type.',
    required: true,
    schema: {
      type: 'object',
      required: ['lessonId', 'type', 'order'],
      properties: {
        files: {
          type: 'array',
          description:
            'Optional: Upload image/audio files. Images (JPEG, PNG, WebP, max 5MB) or Audio (MP3, WAV, OGG, WebM, max 10MB). Up to 3 files allowed.',
          items: {
            type: 'string',
            format: 'binary',
          },
        },
        lessonId: {
          type: 'string',
          description: 'Lesson ID where task belongs',
          example: '64f8c1234567890abcdef789',
        },
        type: {
          type: 'string',
          enum: [
            'Lead-in',
            'Listening (Audio + MCQ)',
            'Recording (Speaking Prompt)',
            'Matching',
            'Ranking',
            'Fill-in-the-Blank',
            'Multiple Choice (Reading)',
            'True/False',
            'Summary (Cloze)',
            'Drag-and-Drop (Categorization)',
            'Paraphrase',
            'Sentence Reordering',
            'Speaking – Part 2 Cue Card',
            'Speaking – Part 3 Discussion',
          ],
          description: 'Task type - determines which fields are relevant',
          example: 'Listening (Audio + MCQ)',
        },
        order: {
          type: 'number',
          description: 'Display order in lesson',
          example: 1,
        },
        title: {
          type: 'string',
          example: 'Task Title',
          description: 'Common field for all task types',
        },
        description: {
          type: 'string',
          example: 'Task Description',
          description: 'Common field for all task types',
        },
        textPrompt: {
          type: 'string',
          example: 'What comes to mind when you hear "IELTS"?',
          description: 'Use with: Lead-in, Paraphrase',
        },
        imageUrl: {
          type: 'string',
          example: '/uploads/tasks/image.jpg',
          description: 'Use with: Lead-in',
        },
        audioUrl: {
          type: 'string',
          example: '/uploads/tasks/audio.mp3',
          description:
            'Use with: Listening (Audio + MCQ), Recording, Speaking tasks',
        },
        options: {
          type: 'array',
          items: { type: 'string' },
          example: ['Option A', 'Option B', 'Option C', 'Option D'],
          description: 'Use with: Listening (Audio + MCQ), Multiple Choice',
        },
        correctOptionIndex: {
          type: 'number',
          example: 2,
          description: 'Use with: Listening (Audio + MCQ)',
        },
        correctOptionIndices: {
          type: 'array',
          items: { type: 'number' },
          example: [0, 2],
          description: 'Use with: Multiple Choice (Reading)',
        },
        promptText: {
          type: 'string',
          example: 'Describe your favorite hobby',
          description: 'Use with: Recording (Speaking Prompt)',
        },
        maxDuration: {
          type: 'number',
          example: 120,
          description: 'Duration in seconds',
        },
        sampleAnswerAudioUrl: {
          type: 'string',
          example: '/uploads/tasks/sample.mp3',
        },
        pairs: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              left: { type: 'string' },
              right: { type: 'string' },
            },
          },
          example: [{ left: 'Apple', right: 'Fruit' }],
          description: 'Use with: Matching',
        },
        correctPairs: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              leftIndex: { type: 'number' },
              rightIndex: { type: 'number' },
            },
          },
          description: 'Use with: Matching',
        },
        items: {
          type: 'array',
          items: { type: 'string' },
          example: ['Item 1', 'Item 2'],
          description: 'Use with: Ranking, Sentence Reordering',
        },
        correctOrder: {
          type: 'array',
          items: { type: 'number' },
          example: [0, 1, 2],
          description: 'Use with: Ranking, Sentence Reordering',
        },
        textTemplate: {
          type: 'string',
          example: 'The __1__ is __2__ today.',
          description: 'Use with: Fill-in-the-Blank, Summary (Cloze)',
        },
        wordBank: {
          type: 'array',
          items: { type: 'string' },
          example: ['weather', 'sunny'],
          description: 'Use with: Fill-in-the-Blank, Summary (Cloze)',
        },
        correctAnswers: {
          type: 'object',
          additionalProperties: { type: 'string' },
          example: { '1': 'weather', '2': 'sunny' },
          description: 'Use with: Fill-in-the-Blank, Summary (Cloze)',
        },
        statements: {
          type: 'array',
          items: { type: 'string' },
          example: ['IELTS has four sections'],
          description: 'Use with: True/False',
        },
        correctFlags: {
          type: 'array',
          items: { type: 'boolean' },
          example: [true, false],
          description: 'Use with: True/False',
        },
        categories: {
          type: 'array',
          items: { type: 'string' },
          example: ['Fruits', 'Vehicles'],
          description: 'Use with: Drag-and-Drop (Categorization)',
        },
        correctMapping: {
          type: 'object',
          additionalProperties: {
            type: 'array',
            items: { type: 'string' },
          },
          example: { Fruits: ['Apple', 'Banana'] },
          description: 'Use with: Drag-and-Drop (Categorization)',
        },
        baseSentence: {
          type: 'string',
          example: 'Original sentence here',
          description: 'Use with: Paraphrase',
        },
        modelAnswer: {
          type: 'string',
          example: 'Model answer here',
          description: 'Use with: Paraphrase, Speaking – Part 3 Discussion',
        },
        segments: {
          type: 'array',
          items: { type: 'string' },
          example: ['First', 'Second'],
          description: 'Use with: Sentence Reordering',
        },
        cueCardText: {
          type: 'string',
          example: 'Describe a place you visited',
          description: 'Use with: Speaking – Part 2 Cue Card',
        },
        notesHint: {
          type: 'array',
          items: { type: 'string' },
          example: ['Where it is'],
          description: 'Use with: Speaking – Part 2 Cue Card',
        },
        questionText: {
          type: 'string',
          example: 'What are the benefits of technology?',
          description: 'Use with: Speaking – Part 3 Discussion',
        },
        keyPoints: {
          type: 'array',
          items: { type: 'string' },
          example: ['Point 1', 'Point 2'],
          description: 'Use with: Speaking – Part 3 Discussion',
        },
      },
    },
  })
  @ApiResponse({
    status: 201,
    description: 'Task created successfully with uploaded files',
    schema: {
      type: 'object',
      properties: {
        _id: { type: 'string', example: '64f8a1234567890abcdef123' },
        lessonId: { type: 'string' },
        type: { type: 'string', example: 'Listening (Audio + MCQ)' },
        order: { type: 'number', example: 1 },
        audioUrl: {
          type: 'string',
          example: '/uploads/tasks/task-audio-1234567890-987654321.mp3',
        },
        options: { type: 'array', items: { type: 'string' } },
        correctOptionIndex: { type: 'number', example: 2 },
      },
    },
  })
  @ApiResponse({
    status: 400,
    description: 'Validation error or invalid file type',
  })
  @ApiResponse({ status: 403, description: 'Admin access required' })
  async createTask(
    @UploadedFiles() files: Express.Multer.File[],
    @Body() body: any,
  ) {
    // Extract form data, ignoring the files property
    const { files: _files, ...taskData } = body;

    const createTaskDto: CreateTaskDto = {
      lessonId: taskData.lessonId,
      type: taskData.type as TaskType,
      order: parseInt(taskData.order),
      title: taskData.title,
      description: taskData.description,
      textPrompt: taskData.textPrompt,
      imageUrl: taskData.imageUrl,
      audioUrl: taskData.audioUrl,
      options: taskData.options,
      correctOptionIndex: taskData.correctOptionIndex
        ? parseInt(taskData.correctOptionIndex)
        : undefined,
      correctOptionIndices: taskData.correctOptionIndices,
      promptText: taskData.promptText,
      maxDuration: taskData.maxDuration
        ? parseInt(taskData.maxDuration)
        : undefined,
      sampleAnswerAudioUrl: taskData.sampleAnswerAudioUrl,
      pairs: taskData.pairs,
      correctPairs: taskData.correctPairs,
      items: taskData.items,
      correctOrder: taskData.correctOrder,
      textTemplate: taskData.textTemplate,
      wordBank: taskData.wordBank,
      correctAnswers: taskData.correctAnswers,
      statements: taskData.statements,
      correctFlags: taskData.correctFlags,
      categories: taskData.categories,
      correctMapping: taskData.correctMapping,
      baseSentence: taskData.baseSentence,
      modelAnswer: taskData.modelAnswer,
      segments: taskData.segments,
      cueCardText: taskData.cueCardText,
      notesHint: taskData.notesHint,
      questionText: taskData.questionText,
      keyPoints: taskData.keyPoints,
    };

    // Process uploaded files and assign URLs
    if (files && files.length > 0) {
      files.forEach((file) => {
        const url = `/uploads/tasks/${file.filename}`;
        if (file.mimetype.startsWith('image/')) {
          if (!createTaskDto.imageUrl) {
            createTaskDto.imageUrl = url;
          }
        } else if (file.mimetype.startsWith('audio/')) {
          if (!createTaskDto.audioUrl) {
            createTaskDto.audioUrl = url;
          } else if (!createTaskDto.sampleAnswerAudioUrl) {
            createTaskDto.sampleAnswerAudioUrl = url;
          }
        }
      });
    }

    return this.adminService.createTask(createTaskDto);
  }

  @Get('lessons/:lessonId/tasks')
  @UseGuards(JwtAuthGuard, AdminGuard)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Get all tasks in a lesson',
    description:
      'Retrieve all tasks for a lesson, including correct answers. Admin only.',
  })
  @ApiResponse({
    status: 200,
    description: 'Tasks retrieved successfully',
    schema: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          _id: { type: 'string', example: '64f8a1234567890abcdef123' },
          lessonId: { type: 'string' },
          type: {
            type: 'string',
            example: 'Multiple Choice (Reading)',
            enum: [
              'Lead-in',
              'Listening (Audio + MCQ)',
              'Recording (Speaking Prompt)',
              'Matching',
              'Ranking',
              'Fill-in-the-Blank',
              'Multiple Choice (Reading)',
              'True/False',
              'Summary (Cloze)',
              'Drag-and-Drop (Categorization)',
              'Paraphrase',
              'Sentence Reordering',
              'Speaking – Part 2 Cue Card',
              'Speaking – Part 3 Discussion',
            ],
          },
          order: { type: 'number', example: 1 },
          title: { type: 'string', example: 'Reading Comprehension' },
          description: { type: 'string' },
          audioUrl: { type: 'string', example: '/uploads/tasks/audio.mp3' },
          imageUrl: { type: 'string', example: '/uploads/tasks/image.jpg' },
          options: {
            type: 'array',
            items: { type: 'string' },
            example: ['Option A', 'Option B', 'Option C', 'Option D'],
          },
          correctOptionIndex: { type: 'number', example: 2 },
        },
      },
    },
  })
  @ApiResponse({ status: 404, description: 'Lesson not found' })
  @ApiResponse({ status: 403, description: 'Admin access required' })
  async getTasksInLesson(@Param('lessonId') lessonId: string) {
    return this.adminService.getTasksInLesson(lessonId);
  }

  @Put('tasks/:id')
  @UseGuards(JwtAuthGuard, AdminGuard)
  @UseInterceptors(
    FilesInterceptor('files', 3, {
      storage: taskImageMulterConfig.storage,
      fileFilter: (req, file, callback) => {
        // Allow both images and audio files
        if (file.mimetype.startsWith('image/')) {
          taskImageMulterConfig.fileFilter(req, file, callback);
        } else if (file.mimetype.startsWith('audio/')) {
          taskAudioMulterConfig.fileFilter(req, file, callback);
        } else {
          callback(
            new BadRequestException('Only image and audio files are allowed'),
            false,
          );
        }
      },
      limits: { fileSize: 10 * 1024 * 1024 }, // 10MB
    }),
  )
  @ApiBearerAuth()
  @ApiConsumes('multipart/form-data')
  @ApiOperation({
    summary: 'Update task with optional file uploads',
    description:
      'Update task properties and optionally upload new files. All fields are optional. Uploaded files will replace existing files.',
  })
  @ApiBody({
    description: 'Task update data with optional image/audio files',
    schema: {
      type: 'object',
      properties: {
        files: {
          type: 'array',
          description:
            'Optional array of image/audio files. Supported: Images (JPEG, PNG, WebP, max 5MB) or Audio (MP3, WAV, OGG, WebM, max 10MB). Up to 3 files allowed.',
          items: {
            type: 'string',
            format: 'binary',
          },
        },
        data: {
          type: 'string',
          description: `JSON string containing fields to update. All fields are optional.
          
Available fields by task type (same as CreateTaskDto):
- Lead-in: textPrompt, imageUrl
- Listening MCQ: audioUrl, options[], correctOptionIndex
- Recording: promptText, maxDuration, sampleAnswerAudioUrl
- Matching: pairs[], correctPairs[]
- Ranking: items[], correctOrder[]
- Fill-in-Blank: textTemplate, wordBank[], correctAnswers{}
- Multiple Choice: options[], correctOptionIndices[]
- True/False: statements[], correctFlags[]
- Summary Cloze: textTemplate, wordBank[], correctAnswers{}
- Drag-Drop: categories[], correctMapping{}
- Paraphrase: baseSentence, modelAnswer
- Sentence Reordering: segments[], correctOrder[]
- Speaking Part 2: cueCardText, notesHint[]
- Speaking Part 3: questionText, keyPoints[]

Common fields: title, description, type, order`,
          example: JSON.stringify({
            title: 'Updated Task Title',
            description: 'Updated description',
            correctOptionIndex: 1,
          }),
        },
      },
    },
  })
  @ApiResponse({
    status: 200,
    description: 'Task updated successfully',
    schema: {
      type: 'object',
      properties: {
        _id: { type: 'string', example: '64f8a1234567890abcdef123' },
        lessonId: { type: 'string' },
        type: { type: 'string' },
        order: { type: 'number' },
        title: { type: 'string' },
        description: { type: 'string' },
        audioUrl: {
          type: 'string',
          example: '/uploads/tasks/task-audio-1234567890-987654321.mp3',
        },
        imageUrl: {
          type: 'string',
          example: '/uploads/tasks/task-image-1234567890-987654321.jpg',
        },
      },
    },
  })
  @ApiResponse({ status: 404, description: 'Task not found' })
  @ApiResponse({
    status: 400,
    description: 'Validation error or invalid file type',
  })
  @ApiResponse({ status: 403, description: 'Admin access required' })
  async updateTask(
    @Param('id') id: string,
    @UploadedFiles() files: Express.Multer.File[],
    @Body('data') data: string,
  ) {
    let updateTaskDto: UpdateTaskDto;
    try {
      updateTaskDto = JSON.parse(data);
    } catch (e) {
      throw new BadRequestException('Invalid JSON in data field');
    }

    // Process uploaded files and assign URLs
    if (files && files.length > 0) {
      files.forEach((file) => {
        const url = `/uploads/tasks/${file.filename}`;
        if (file.mimetype.startsWith('image/')) {
          updateTaskDto.imageUrl = url;
        } else if (file.mimetype.startsWith('audio/')) {
          if (!updateTaskDto.audioUrl) {
            updateTaskDto.audioUrl = url;
          } else {
            updateTaskDto.sampleAnswerAudioUrl = url;
          }
        }
      });
    }

    return this.adminService.updateTask(id, updateTaskDto);
  }

  @Delete('tasks/:id')
  @UseGuards(JwtAuthGuard, AdminGuard)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Delete task',
    description:
      'Permanently delete a task from a lesson. This action cannot be undone.',
  })
  @ApiResponse({
    status: 200,
    description: 'Task deleted successfully',
    schema: {
      type: 'object',
      properties: {
        message: {
          type: 'string',
          example: 'Task deleted successfully',
        },
      },
    },
  })
  @ApiResponse({ status: 404, description: 'Task not found' })
  @ApiResponse({ status: 403, description: 'Admin access required' })
  async deleteTask(@Param('id') id: string) {
    return this.adminService.deleteTask(id);
  }
}

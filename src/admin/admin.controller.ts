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
  NestInterceptor,
  ExecutionContext,
  CallHandler,
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
import {
  CreateInterestDto,
  UpdateInterestDto,
} from './dto/create-interest.dto';
import { CreateTaskDto, UpdateTaskDto } from './dto/create-task.dto';
import { TaskType } from '../lessons/schemas/task.schema';
import { Express } from 'express';

class ParseSectionPayloadInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler) {
    const request = context.switchToHttp().getRequest();
    const body = request?.body;

    if (body) {
      try {
        if (typeof body.sessionPlans === 'string') {
          body.sessionPlans = JSON.parse(body.sessionPlans);
        }
        if (typeof body.presentation === 'string') {
          body.presentation = JSON.parse(body.presentation);
        }
        if (typeof body.quickTips === 'string') {
          body.quickTips = JSON.parse(body.quickTips);
        }
      } catch (error) {
        throw new BadRequestException('Invalid JSON format in section payload');
      }
    }

    return next.handle();
  }
}

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
  @UseInterceptors(FileInterceptor('image'), ParseSectionPayloadInterceptor)
  @ApiBearerAuth()
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    description: 'Section creation payload with optional image upload',
    schema: {
      type: 'object',
      properties: {
        title: {
          type: 'string',
          example: 'Speaking Part 1 - Personal Questions',
        },
        description: {
          type: 'string',
          example: 'Learn how to answer personal questions with confidence.',
        },
        unitId: { type: 'string', example: '64f8b1234567890abcdef456' },
        order: { type: 'number', example: 1 },
        image: {
          type: 'string',
          format: 'binary',
          description: 'Section cover image',
        },
        sessionPlans: {
          type: 'array',
          items: { type: 'string' },
          example: ['Understand question types', 'Practice sample answers'],
          description: 'Add each learning outcome as a separate field',
        },
        presentation: {
          type: 'string',
          example:
            '{"title":"Key Speaking Strategies","cards":["Listen and respond naturally","Structure answers clearly"]}',
          description: 'JSON object string for presentation section',
        },
        quickTips: {
          type: 'string',
          example:
            '{"cards":["Practice aloud every day","Record and review progress","Use timers to simulate exam conditions","Reflect on strengths and weaknesses"]}',
          description: 'JSON object string for quick tips',
        },
      },
      required: ['title', 'description', 'unitId', 'order'],
    },
    examples: {
      formData: {
        summary: 'multipart/form-data example',
        value: {
          title: 'Speaking Part 1 - Personal Questions',
          description:
            'Learn how to answer personal questions with confidence.',
          unitId: '64f8b1234567890abcdef456',
          order: 1,
          sessionPlans: [
            'Understand question types',
            'Practice sample answers',
          ],
          presentation:
            '{"title":"Key Speaking Strategies","cards":["Listen and respond naturally","Structure answers clearly"]}',
          quickTips:
            '{"cards":["Practice aloud every day","Record and review progress"]}',
        },
      },
    },
  })
  @ApiOperation({ summary: 'Create section in unit' })
  async createSection(
    @UploadedFile() image: Express.Multer.File,
    @Body() createSectionDto: CreateSectionDto,
  ) {
    try {
      // sessionPlans
      if (
        typeof createSectionDto.sessionPlans === 'string' &&
        createSectionDto.sessionPlans !== ''
      ) {
        createSectionDto.sessionPlans = JSON.parse(
          createSectionDto.sessionPlans,
        );
      }

      // presentation
      if (
        typeof createSectionDto.presentation === 'string' &&
        createSectionDto.presentation !== ''
      ) {
        createSectionDto.presentation = JSON.parse(
          createSectionDto.presentation,
        );
      }

      // quickTips
      if (
        typeof createSectionDto.quickTips === 'string' &&
        createSectionDto.quickTips !== ''
      ) {
        createSectionDto.quickTips = JSON.parse(createSectionDto.quickTips);
      }
    } catch (error) {
      throw new BadRequestException('Invalid JSON format in section payload');
    }

    if (image) {
      createSectionDto.image = `/uploads/sections/${image.filename}`;
    }

    return this.adminService.createSection(createSectionDto);
  }

  @Put('sections/:id')
  @UseGuards(JwtAuthGuard, AdminGuard)
  @UseInterceptors(FileInterceptor('image'), ParseSectionPayloadInterceptor)
  @ApiBearerAuth()
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    description: 'Section update payload with optional image upload',
    schema: {
      type: 'object',
      properties: {
        title: { type: 'string', example: 'Updated Speaking Part 1' },
        description: {
          type: 'string',
          example: 'Refined guidance for personal questions',
        },
        order: { type: 'number', example: 2 },
        image: {
          type: 'string',
          format: 'binary',
          description: 'New section cover image',
        },
        sessionPlans: {
          type: 'array',
          items: { type: 'string' },
          example: ['Revise warm-up prompts', 'Drill follow-up strategies'],
          description: 'Add each learning outcome as a separate field',
        },
        presentation: {
          type: 'string',
          example:
            '{"title":"Refreshed Strategies","cards":["Clarify question intent quickly","Use linking phrases effectively"]}',
          description: 'JSON object string for presentation section',
        },
        quickTips: {
          type: 'string',
          example:
            '{"cards":["Time yourself","Review recordings each week","Practice mock interviews","Track progress weekly"]}',
          description: 'JSON object string for quick tips',
        },
      },
    },
    examples: {
      formData: {
        summary: 'multipart/form-data example',
        value: {
          title: 'Updated Speaking Part 1',
          order: 2,
          sessionPlans: [
            'Revise warm-up prompts',
            'Drill follow-up strategies',
          ],
          presentation:
            '{"title":"Refreshed Strategies","cards":["Clarify question intent quickly","Use linking phrases effectively"]}',
          quickTips:
            '{"cards":["Time yourself","Review recordings each week"]}',
        },
      },
    },
  })
  @ApiOperation({ summary: 'Update section' })
  async updateSection(
    @Param('id') id: string,
    @UploadedFile() image: Express.Multer.File,
    @Body() updateSectionDto: UpdateSectionDto,
  ) {
    try {
      if (typeof updateSectionDto.sessionPlans === 'string') {
        updateSectionDto.sessionPlans = JSON.parse(
          updateSectionDto.sessionPlans,
        );
      }
      if (typeof updateSectionDto.presentation === 'string') {
        updateSectionDto.presentation = JSON.parse(
          updateSectionDto.presentation,
        );
      }
      if (typeof updateSectionDto.quickTips === 'string') {
        updateSectionDto.quickTips = JSON.parse(updateSectionDto.quickTips);
      }
    } catch (error) {
      throw new BadRequestException('Invalid JSON format in section payload');
    }

    if (image) {
      updateSectionDto.image = `/uploads/sections/${image.filename}`;
    }

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

  // Admin: lesson endpoints removed

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
      required: ['sectionId', 'order'],
      properties: {
        files: {
          type: 'array',
          items: { type: 'string', format: 'binary' },
          description: 'Optional image files (JPEG, PNG, WebP, max 5MB)',
        },
        sectionId: { type: 'string', example: '64f8c1234567890abcdef789' },
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
      sectionId: taskData.sectionId,
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
      required: ['sectionId', 'order', 'options', 'correctOptionIndex'],
      properties: {
        files: {
          type: 'array',
          items: { type: 'string', format: 'binary' },
          description: 'Audio file (MP3, WAV, OGG, WebM, max 10MB)',
        },
        sectionId: { type: 'string', example: '64f8c1234567890abcdef789' },
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
      sectionId: taskData.sectionId,
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
      required: ['sectionId', 'order', 'promptText'],
      properties: {
        sectionId: { type: 'string' },
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
      required: ['sectionId', 'order', 'pairs', 'correctPairs'],
      properties: {
        sectionId: { type: 'string' },
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
      required: ['sectionId', 'order', 'items', 'correctOrder'],
      properties: {
        sectionId: { type: 'string' },
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
        'sectionId',
        'order',
        'textTemplate',
        'wordBank',
        'correctAnswers',
      ],
      properties: {
        sectionId: { type: 'string' },
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
      required: ['sectionId', 'order', 'options', 'correctOptionIndices'],
      properties: {
        sectionId: { type: 'string' },
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
      required: ['sectionId', 'order', 'statements', 'correctFlags'],
      properties: {
        sectionId: { type: 'string' },
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
        'sectionId',
        'order',
        'textTemplate',
        'wordBank',
        'correctAnswers',
      ],
      properties: {
        sectionId: { type: 'string' },
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
  @UseInterceptors(FilesInterceptor('files', 0))
  @UseGuards(JwtAuthGuard, AdminGuard)
  @ApiBearerAuth()
  @ApiConsumes('multipart/form-data')
  @ApiOperation({ summary: 'Create Drag-and-Drop (Categorization) task' })
  @ApiBody({
    description: 'Drag items into categories',
    schema: {
      type: 'object',
      required: ['sectionId', 'order', 'categories', 'correctMapping'],
      properties: {
        sectionId: { type: 'string' },
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
      required: ['sectionId', 'order', 'baseSentence'],
      properties: {
        sectionId: { type: 'string' },
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
      required: ['sectionId', 'order', 'segments', 'correctOrder'],
      properties: {
        sectionId: { type: 'string' },
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
      required: ['sectionId', 'order', 'cueCardText'],
      properties: {
        sectionId: { type: 'string' },
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
      required: ['sectionId', 'order', 'questionText'],
      properties: {
        sectionId: { type: 'string' },
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
    summary: 'Create task in session (section) with optional file uploads',
    description:
      'Create a task with support for image and audio file uploads. Upload up to 3 files (images or audio). Files are automatically stored and URLs are assigned to appropriate fields.',
  })
  @ApiBody({
    description:
      'Task data with optional image/audio files. Only fill fields relevant to your selected task type.',
    required: true,
    schema: {
      type: 'object',
      required: ['sectionId', 'type', 'order'],
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
        sectionId: {
          type: 'string',
          description: 'Section (session) ID where task belongs',
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
          description: 'Display order in section',
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
        sectionId: { type: 'string' },
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
      sectionId: taskData.sectionId,
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

  @Get('sections/:sectionId/tasks')
  @UseGuards(JwtAuthGuard, AdminGuard)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Get all tasks in a section',
    description:
      'Retrieve all tasks for a section, including correct answers. Admin only.',
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
          sectionId: { type: 'string' },
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
  @ApiResponse({ status: 404, description: 'Section not found' })
  @ApiResponse({ status: 403, description: 'Admin access required' })
  async getTasksInLesson(@Param('sectionId') sectionId: string) {
    return this.adminService.getTasksInSection(sectionId);
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
        sectionId: { type: 'string' },
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
      'Permanently delete a task from a section. This action cannot be undone.',
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

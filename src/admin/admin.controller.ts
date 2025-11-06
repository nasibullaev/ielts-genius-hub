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

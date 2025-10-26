import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  UseGuards,
  Request,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiProperty,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { LessonsService } from './lessons.service';
import { QuizAnswerDto } from './dto/quiz-answer.dto';
import { TaskBatchSubmissionDto } from './dto/task-submit.dto';

export class QuizResultDto {
  @ApiProperty({ example: 85 })
  score: number;

  @ApiProperty({ example: 8 })
  correctAnswers: number;

  @ApiProperty({ example: 10 })
  totalQuestions: number;

  @ApiProperty({ example: 'You scored 85% (8/10)' })
  message: string;

  @ApiProperty({
    example: [
      {
        questionId: '64f8a1234567890abcdef123',
        question: 'What is the capital of France?',
        options: ['London', 'Paris', 'Berlin', 'Madrid'],
        userAnswer: 1,
        correctAnswer: 1,
        isCorrect: true,
      },
    ],
  })
  results: object[];
}

export class TaskResultDto {
  @ApiProperty({ example: 85, nullable: true })
  overallScore: number | null;

  @ApiProperty({ example: 8 })
  correctAnswers: number;

  @ApiProperty({ example: 10 })
  totalQuestions: number;

  @ApiProperty({
    example: [
      {
        taskId: '64f8a1234567890abcdef123',
        type: 'Multiple Choice (Reading)',
        isCorrect: true,
        score: 100,
        feedback: 'Correct!',
      },
    ],
  })
  results: Array<{
    taskId: string;
    type: string;
    isCorrect: boolean;
    score: number;
    feedback: string;
  }>;

  @ApiProperty({ example: 'You scored 85% (8/10)' })
  message: string;
}

@ApiTags('lessons')
@Controller('lessons')
export class LessonsController {
  constructor(private readonly lessonsService: LessonsService) {}

  @Get(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get lesson content (Paid users only)' })
  @ApiResponse({ status: 200, description: 'Lesson content retrieved' })
  @ApiResponse({ status: 403, description: 'Payment required' })
  @ApiResponse({ status: 404, description: 'Lesson not found' })
  async getLesson(@Param('id') id: string, @Request() req) {
    return this.lessonsService.getLesson(id, req.user.sub);
  }

  @Post(':id/complete')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Mark lesson as completed' })
  @ApiResponse({ status: 200, description: 'Lesson marked as completed' })
  async completeLesson(@Param('id') id: string, @Request() req) {
    return this.lessonsService.completeLesson(id, req.user.sub);
  }

  @Post(':id/quiz')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Submit quiz answers' })
  @ApiResponse({
    status: 200,
    description: 'Quiz submitted and evaluated',
    type: QuizResultDto,
  })
  @ApiResponse({ status: 403, description: 'Payment required' })
  async submitQuiz(
    @Param('id') id: string,
    @Request() req,
    @Body() quizAnswers: QuizAnswerDto,
  ) {
    return this.lessonsService.submitQuiz(id, req.user.sub, quizAnswers);
  }

  @Post(':id/tasks')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Submit tasks for evaluation' })
  @ApiResponse({
    status: 200,
    description: 'Tasks submitted and evaluated',
    type: TaskResultDto,
  })
  @ApiResponse({ status: 403, description: 'Payment required' })
  @ApiResponse({ status: 404, description: 'Lesson not found' })
  async submitTasks(
    @Param('id') id: string,
    @Request() req,
    @Body() taskSubmissions: TaskBatchSubmissionDto,
  ) {
    return this.lessonsService.submitTasks(id, req.user.sub, taskSubmissions);
  }
}

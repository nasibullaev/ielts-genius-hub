import {
  Controller,
  Get,
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
} from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { LevelCheckerService } from './level-checker.service';
import { SubmitEssayDto } from './dto/submit-essay.dto';
import {
  SubmitWritingTask1Dto,
  WritingTask1ResponseDto,
} from './dto/writing-task1.dto';

// Response DTOs for Swagger
export class TopicResponseDto {
  @ApiProperty({
    example:
      'Some people believe that universities should require every student to take a variety of courses outside their major field of study. Others believe that universities should not force students to take any courses other than those that will help prepare them for jobs in their chosen fields. Discuss both views and give your own opinion.',
  })
  topic: string;
}

export class EvaluationResponseDto {
  @ApiProperty({ example: '6.5' })
  overallBand: string;

  @ApiProperty({ example: '6' })
  taskAchievement: string;

  @ApiProperty({ example: '7' })
  coherenceCohesion: string;

  @ApiProperty({ example: '6' })
  lexicalResource: string;

  @ApiProperty({ example: '7' })
  grammaticalRange: string;

  @ApiProperty({
    example:
      'Your essay demonstrates good understanding of the topic with clear arguments...',
  })
  feedback: string;

  @ApiProperty({
    example: [
      'Use more varied vocabulary',
      'Work on paragraph transitions',
      'Include more specific examples',
    ],
  })
  suggestions: string[];
}

@ApiTags('level-checker')
@Controller('level-checker')
export class LevelCheckerController {
  constructor(private readonly levelCheckerService: LevelCheckerService) {}

  // Writing Task 2 endpoints
  @Get('writing-2')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Get Writing Task 2 topic',
    description:
      'Generates a personalized IELTS Writing Task 2 topic based on user interests',
  })
  @ApiResponse({
    status: 200,
    description: 'Writing Task 2 topic generated successfully',
    type: TopicResponseDto,
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - Invalid or missing JWT token',
  })
  @ApiResponse({ status: 400, description: 'Failed to generate topic' })
  async getWritingTask2Topic(@Request() req) {
    return this.levelCheckerService.generateWritingTask2Topic(req.user.sub);
  }

  @Post('writing-2')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Submit Writing Task 2 essay for evaluation',
    description:
      'Evaluates the submitted Writing Task 2 essay using Gemini AI and saves the submission to database',
  })
  @ApiResponse({
    status: 200,
    description: 'Writing Task 2 essay evaluated successfully',
  })
  @ApiResponse({
    status: 400,
    description: 'Validation error or evaluation failed',
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - Invalid or missing JWT token',
  })
  async submitWritingTask2Essay(
    @Request() req,
    @Body() submitEssayDto: SubmitEssayDto,
  ) {
    return this.levelCheckerService.evaluateWritingTask2Essay(
      req.user.sub,
      submitEssayDto.topic,
      submitEssayDto.essay,
      submitEssayDto.timeSpent,
    );
  }

  // Writing Task 1 endpoints
  @Get('writing-1')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Get Writing Task 1 topic with chart',
    description:
      'Generates a random IELTS Writing Task 1 topic with AI-generated chart using Chart.js',
  })
  @ApiResponse({
    status: 200,
    description: 'Writing Task 1 topic and chart generated successfully',
    type: WritingTask1ResponseDto,
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - Invalid or missing JWT token',
  })
  @ApiResponse({ status: 400, description: 'Failed to generate topic' })
  async getWritingTask1Topic(@Request() req) {
    return this.levelCheckerService.generateWritingTask1Topic(req.user.sub);
  }

  @Post('writing-1')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Submit Writing Task 1 response for evaluation',
    description:
      'Evaluates the submitted Writing Task 1 response using Gemini AI and saves the submission to database',
  })
  @ApiResponse({
    status: 200,
    description: 'Writing Task 1 response evaluated successfully',
  })
  @ApiResponse({
    status: 400,
    description: 'Validation error or evaluation failed',
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - Invalid or missing JWT token',
  })
  async submitWritingTask1Essay(
    @Request() req,
    @Body() submitWritingTask1Dto: SubmitWritingTask1Dto,
  ) {
    return this.levelCheckerService.evaluateWritingTask1Essay(
      req.user.sub,
      submitWritingTask1Dto.question,
      submitWritingTask1Dto.imageUrl,
      submitWritingTask1Dto.taskType,
      submitWritingTask1Dto.answer,
      submitWritingTask1Dto.timeSpent,
    );
  }
}

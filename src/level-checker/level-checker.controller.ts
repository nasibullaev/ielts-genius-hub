// src/level-checker/level-checker.controller.ts
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

  @Get()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Get writing topic',
    description: 'Generates a random IELTS Writing Task 2 topic using ChatGPT',
  })
  @ApiResponse({
    status: 200,
    description: 'Writing topic generated successfully',
    type: TopicResponseDto,
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - Invalid or missing JWT token',
  })
  @ApiResponse({ status: 400, description: 'Failed to generate topic' })
  async getTopic(@Request() req) {
    return this.levelCheckerService.generateWritingTopic();
  }

  @Post()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Submit essay for evaluation',
    description:
      'Evaluates the submitted essay using ChatGPT and returns IELTS band scores with feedback',
  })
  @ApiResponse({
    status: 200,
    description: 'Essay evaluated successfully',
    type: EvaluationResponseDto,
  })
  @ApiResponse({
    status: 400,
    description: 'Validation error or evaluation failed',
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - Invalid or missing JWT token',
  })
  async submitEssay(@Request() req, @Body() submitEssayDto: SubmitEssayDto) {
    return this.levelCheckerService.evaluateEssay(
      submitEssayDto.topic,
      submitEssayDto.essay,
    );
  }
}

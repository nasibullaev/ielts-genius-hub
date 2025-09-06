import {
  IsString,
  IsNotEmpty,
  MinLength,
  IsNumber,
  Min,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class SubmitWritingTask1Dto {
  @ApiProperty({
    example: 'The chart shows sales data from 2018 to 2022...',
    description: 'The writing task description that was provided',
  })
  @IsString()
  @IsNotEmpty()
  question: string;

  @ApiProperty({
    example: '/uploads/writing-task1/chart-1234567890.png',
    description: 'The URL of the generated chart image',
  })
  @IsString()
  @IsNotEmpty()
  imageUrl: string;

  @ApiProperty({
    example: 'bar_chart',
    description: 'The type of chart (bar_chart, line_graph, pie_chart, etc.)',
  })
  @IsString()
  @IsNotEmpty()
  taskType: string;

  @ApiProperty({
    example:
      'The bar chart illustrates the sales performance of Company ABC from 2018 to 2022, showing significant growth over the five-year period.',
    description: "The student's written response (50-100 words)",
  })
  @IsString()
  @IsNotEmpty()
  @MinLength(50, { message: 'Response must be at least 50 words' })
  answer: string;

  @ApiProperty({
    example: 25,
    description: 'Time spent writing the response in minutes',
  })
  @IsNumber()
  @Min(1)
  timeSpent: number;
}

// Response DTOs for Swagger
export class WritingTask1ResponseDto {
  @ApiProperty({
    example: 'The chart shows sales data from 2018 to 2022...',
  })
  question: string;

  @ApiProperty({
    example: '/uploads/writing-task1/chart-1234567890.png',
  })
  imageUrl: string;

  @ApiProperty({
    example: 'bar_chart',
  })
  taskType: string;

  @ApiProperty({
    example:
      'The bar chart illustrates the sales performance of Company ABC from 2018 to 2022, showing significant growth over the five-year period.',
  })
  dataDescription: string;
}

export class WritingTask1EvaluationResponseDto {
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
      'Your response demonstrates good understanding of the chart with clear overview...',
  })
  feedback: string;

  @ApiProperty({
    example: [
      'Include more specific data points',
      'Work on paragraph structure',
      'Use more varied vocabulary',
    ],
  })
  suggestions: string[];

  @ApiProperty({ example: 156 })
  wordCount: number;

  @ApiProperty({ example: '64f8a1234567890abcdef123' })
  submissionId: string;
}

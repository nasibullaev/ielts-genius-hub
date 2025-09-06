import {
  IsString,
  IsNotEmpty,
  IsArray,
  ValidateNested,
  IsEnum,
  IsOptional,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';

export enum ReadingQuestionType {
  TRUE_FALSE_NOT_GIVEN = 'true_false_not_given',
  MULTIPLE_CHOICE = 'multiple_choice',
  INPUT_TEXT = 'input_text',
  MATCHING = 'matching',
  HEADING_MATCHING = 'heading_matching',
}

export class ReadingQuestionDto {
  @ApiProperty({
    example: 'What is the main topic discussed in the passage?',
    description: 'The question text',
  })
  @IsString()
  @IsNotEmpty()
  question: string;

  @ApiProperty({
    example: 'true_false_not_given',
    enum: ReadingQuestionType,
    description: 'Type of question',
  })
  @IsEnum(ReadingQuestionType)
  questionType: ReadingQuestionType;

  @ApiProperty({
    example: ['True', 'False', 'Not Given'],
    description: 'Options for multiple choice or true/false questions',
    required: false,
  })
  @IsArray()
  @IsOptional()
  options?: string[];

  @ApiProperty({
    example: 'True',
    description: 'Correct answer',
  })
  @IsString()
  @IsNotEmpty()
  correctAnswer: string;

  @ApiProperty({
    example:
      'The passage clearly states that climate change is the main topic.',
    description: 'Explanation for the correct answer',
  })
  @IsString()
  @IsNotEmpty()
  explanation: string;
}

export class SubmitReadingDto {
  @ApiProperty({
    example: 'test_1234567890',
    description: 'The test ID that was provided when getting the reading test',
  })
  @IsString()
  @IsNotEmpty()
  testId: string;

  @ApiProperty({
    example: [
      'True',
      'B',
      'environment',
      'False',
      'C',
      'technology',
      'True',
      'A',
      'sustainable',
      'Not Given',
    ],
    description: 'User answers in the same order as questions',
  })
  @IsArray()
  @IsString({ each: true })
  userAnswers: string[];

  @ApiProperty({
    example: '20',
    description: 'Time spent on the reading test in minutes',
  })
  @IsString()
  @IsNotEmpty()
  timeSpent: string;
}

// Response DTOs for Swagger
export class ReadingResponseDto {
  @ApiProperty({
    example: 'test_1234567890',
    description: 'Unique test ID for this reading test',
  })
  testId: string;

  @ApiProperty({
    example: 'Climate change is one of the most pressing issues of our time...',
  })
  readingText: string;

  @ApiProperty({
    example: [
      {
        question: 'What is the main topic discussed in the passage?',
        questionType: 'true_false_not_given',
        options: ['True', 'False', 'Not Given'],
      },
    ],
    description: 'Questions without correct answers',
  })
  questions: Array<{
    question: string;
    questionType: string;
    options?: string[];
  }>;
}

export class ReadingEvaluationResponseDto {
  @ApiProperty({ example: '7.5' })
  overallBand: string;

  @ApiProperty({ example: 8 })
  correctAnswers: number;

  @ApiProperty({ example: 10 })
  totalQuestions: number;

  @ApiProperty({ example: 80 })
  percentage: number;

  @ApiProperty({
    example: [
      {
        questionIndex: 0,
        question: 'What is the main topic discussed in the passage?',
        userAnswer: 'True',
        correctAnswer: 'True',
        isCorrect: true,
        explanation:
          'The passage clearly states that climate change is the main topic.',
      },
    ],
  })
  detailedResults: Array<{
    questionIndex: number;
    question: string;
    userAnswer: string;
    correctAnswer: string;
    isCorrect: boolean;
    explanation: string;
  }>;

  @ApiProperty({
    example: 'Good performance! You answered most questions correctly...',
  })
  feedback: string;

  @ApiProperty({
    example: [
      'Focus on reading for specific details',
      'Practice with different text types',
      'Work on skimming and scanning skills',
    ],
  })
  suggestions: string[];

  @ApiProperty({ example: '68bc29e80314eef078385103' })
  submissionId: string;
}

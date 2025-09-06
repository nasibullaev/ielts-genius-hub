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

export enum QuestionType {
  TRUE_FALSE_NOT_GIVEN = 'true_false_not_given',
  MULTIPLE_CHOICE = 'multiple_choice',
  INPUT_TEXT = 'input_text',
}

export class QuestionDto {
  @ApiProperty({
    example: 'What is the main topic discussed in the audio?',
    description: 'The question text',
  })
  @IsString()
  @IsNotEmpty()
  question: string;

  @ApiProperty({
    example: 'true_false_not_given',
    enum: QuestionType,
    description: 'Type of question',
  })
  @IsEnum(QuestionType)
  questionType: QuestionType;

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
    example: 'The audio discusses environmental issues.',
    description: 'Explanation for the correct answer',
  })
  @IsString()
  @IsNotEmpty()
  explanation: string;
}

export class SubmitListeningDto {
  @ApiProperty({
    example: 'test_1234567890',
    description:
      'The test ID that was provided when getting the listening test',
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
    example: '15',
    description: 'Time spent on the listening test in minutes',
  })
  @IsString()
  @IsNotEmpty()
  timeSpent: string;
}

// Response DTOs for Swagger
export class ListeningResponseDto {
  @ApiProperty({
    example: 'test_1234567890',
    description: 'Unique test ID for this listening test',
  })
  testId: string;

  @ApiProperty({
    example: 'Climate change is one of the most pressing issues of our time...',
  })
  listeningText: string;

  @ApiProperty({
    example: [
      {
        question: 'What is the main topic discussed in the audio?',
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

export class ListeningEvaluationResponseDto {
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
        question: 'What is the main topic discussed in the audio?',
        userAnswer: 'True',
        correctAnswer: 'True',
        isCorrect: true,
        explanation: 'The audio discusses environmental issues.',
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
      'Focus on listening for specific details',
      'Practice with different accents',
      'Work on note-taking skills',
    ],
  })
  suggestions: string[];

  @ApiProperty({ example: '68bc29e80314eef078385103' })
  submissionId: string;
}

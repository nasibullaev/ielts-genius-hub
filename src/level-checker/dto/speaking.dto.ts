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

export enum SpeakingQuestionType {
  PERSONAL_INTRODUCTION = 'personal_introduction',
  INDIVIDUAL_LONG_TURN = 'individual_long_turn',
  TWO_WAY_DISCUSSION = 'two_way_discussion',
}

export class SpeakingQuestionDto {
  @ApiProperty({
    example: 'Tell me about your hometown.',
    description: 'The question text',
  })
  @IsString()
  @IsNotEmpty()
  question: string;

  @ApiProperty({
    example: 'personal_introduction',
    enum: SpeakingQuestionType,
    description: 'Type of speaking question',
  })
  @IsEnum(SpeakingQuestionType)
  questionType: SpeakingQuestionType;

  @ApiProperty({
    example:
      'You have 2 minutes to speak. You should talk about the topic continuously.',
    description: 'Instructions for the question',
  })
  @IsString()
  @IsNotEmpty()
  instructions: string;

  @ApiProperty({
    example:
      'Talk about your hometown, including its location, population, and what you like about it.',
    description: 'Additional guidance for the question',
  })
  @IsString()
  @IsNotEmpty()
  guidance: string;
}

export class SubmitSpeakingDto {
  @ApiProperty({
    example: 'test_1234567890',
    description: 'The test ID that was provided when getting the speaking test',
  })
  @IsString()
  @IsNotEmpty()
  testId: string;

  @ApiProperty({
    example: '15',
    description: 'Time spent on the speaking test in minutes',
  })
  @IsString()
  @IsNotEmpty()
  timeSpent: string;
}

// Response DTOs for Swagger
export class SpeakingResponseDto {
  @ApiProperty({
    example: 'test_1234567890',
    description: 'Unique test ID for this speaking test',
  })
  testId: string;

  @ApiProperty({
    example: [
      {
        question: 'Tell me about your hometown.',
        questionType: 'personal_introduction',
        instructions:
          'You have 2 minutes to speak. You should talk about the topic continuously.',
        guidance:
          'Talk about your hometown, including its location, population, and what you like about it.',
      },
    ],
    description: 'Speaking questions with instructions',
  })
  questions: Array<{
    question: string;
    questionType: string;
    instructions: string;
    guidance: string;
  }>;
}

export class SpeakingEvaluationResponseDto {
  @ApiProperty({ example: '7.5' })
  overallBand: string;

  @ApiProperty({ example: '7' })
  fluencyCoherence: string;

  @ApiProperty({ example: '8' })
  lexicalResource: string;

  @ApiProperty({ example: '7' })
  grammaticalRange: string;

  @ApiProperty({ example: '8' })
  pronunciation: string;

  @ApiProperty({
    example:
      'Good performance! You demonstrated clear communication with good vocabulary range...',
  })
  feedback: string;

  @ApiProperty({
    example: [
      'Work on reducing pauses and hesitations',
      'Practice using more complex grammatical structures',
      'Focus on improving pronunciation of difficult words',
    ],
  })
  suggestions: string[];

  @ApiProperty({
    example: [
      {
        questionIndex: 0,
        question: 'Tell me about your hometown.',
        userAnswer: 'My hometown is New York City...',
        fluencyScore: '7',
        vocabularyScore: '8',
        grammarScore: '7',
        pronunciationScore: '8',
        feedback: 'Good use of descriptive vocabulary and clear pronunciation.',
      },
    ],
  })
  detailedResults: Array<{
    questionIndex: number;
    question: string;
    userAnswer: string;
    fluencyScore: string;
    vocabularyScore: string;
    grammarScore: string;
    pronunciationScore: string;
    feedback: string;
  }>;

  @ApiProperty({ example: '68bc29e80314eef078385103' })
  submissionId: string;
}

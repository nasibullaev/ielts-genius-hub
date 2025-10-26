import {
  IsNotEmpty,
  IsString,
  IsOptional,
  IsArray,
  IsNumber,
  IsBoolean,
  IsObject,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';

export class TaskSubmissionDto {
  @ApiProperty({ example: '64f8a1234567890abcdef123' })
  @IsNotEmpty()
  @IsString()
  taskId: string;

  @ApiProperty({
    example: {
      type: 'Multiple Choice',
      selectedOption: 2,
    },
    description: 'Task-specific submission data',
  })
  @IsNotEmpty()
  @IsObject()
  submission: Record<string, any>;
}

export class TaskBatchSubmissionDto {
  @ApiProperty({
    example: [
      {
        taskId: '64f8a1234567890abcdef123',
        submission: { type: 'Multiple Choice', selectedOption: 2 },
      },
      {
        taskId: '64f8a1234567890abcdef124',
        submission: {
          type: 'Matching',
          pairs: [
            [0, 1],
            [1, 0],
          ],
        },
      },
    ],
  })
  @IsNotEmpty()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => TaskSubmissionDto)
  submissions: TaskSubmissionDto[];
}

// Specific DTOs for different task types

export class ListeningMcqSubmissionDto {
  @ApiProperty({ example: 2 })
  @IsNotEmpty()
  @IsNumber()
  selectedOption: number;
}

export class RecordingSubmissionDto {
  @ApiProperty({ example: 'base64_audio_data_or_url' })
  @IsNotEmpty()
  @IsString()
  audioUrl: string;
}

export class MatchingSubmissionDto {
  @ApiProperty({
    example: [
      [0, 1],
      [1, 0],
      [2, 2],
    ],
    description: 'Array of [leftIndex, rightIndex] pairs',
  })
  @IsNotEmpty()
  @IsArray()
  pairs: [number, number][];
}

export class RankingSubmissionDto {
  @ApiProperty({ example: [2, 0, 1, 3] })
  @IsNotEmpty()
  @IsArray()
  @IsNumber({}, { each: true })
  order: number[];
}

export class FillInBlankSubmissionDto {
  @ApiProperty({
    example: { 1: 'the', 2: 'a', 3: 'the' },
    description: 'Map of position -> word',
  })
  @IsNotEmpty()
  @IsObject()
  answers: Record<string, string>;
}

export class MultipleChoiceSubmissionDto {
  @ApiProperty({ example: [1, 3] })
  @IsArray()
  @IsNumber({}, { each: true })
  selectedOptions: number[];
}

export class TrueFalseSubmissionDto {
  @ApiProperty({ example: [true, false, true] })
  @IsNotEmpty()
  @IsArray()
  @IsBoolean({ each: true })
  answers: boolean[];
}

export class SummaryClozeSubmissionDto {
  @ApiProperty({
    example: { 1: 'the', 2: 'a' },
    description: 'Map of position -> word',
  })
  @IsNotEmpty()
  @IsObject()
  answers: Record<string, string>;
}

export class DragDropSubmissionDto {
  @ApiProperty({
    example: { Category1: ['item1', 'item2'], Category2: ['item3'] },
    description: 'Map of category -> items',
  })
  @IsNotEmpty()
  @IsObject()
  mapping: Record<string, string[]>;
}

export class ParaphraseSubmissionDto {
  @ApiProperty({ example: 'This is my rephrased sentence.' })
  @IsNotEmpty()
  @IsString()
  answer: string;
}

export class SentenceReorderingSubmissionDto {
  @ApiProperty({ example: [2, 0, 1, 3] })
  @IsNotEmpty()
  @IsArray()
  @IsNumber({}, { each: true })
  order: number[];
}

export class SpeakingPart2SubmissionDto {
  @ApiProperty({ example: 'base64_audio_data_or_url' })
  @IsNotEmpty()
  @IsString()
  audioUrl: string;
}

export class SpeakingPart3SubmissionDto {
  @ApiProperty({ example: 'base64_audio_data_or_url' })
  @IsNotEmpty()
  @IsString()
  audioUrl: string;
}

export class LeadInSubmissionDto {
  @ApiProperty({ example: 'Student response text' })
  @IsOptional()
  @IsString()
  response?: string;
}

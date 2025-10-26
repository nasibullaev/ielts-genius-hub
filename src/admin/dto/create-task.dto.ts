import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsNumber,
  IsEnum,
  IsArray,
  IsBoolean,
  IsUrl,
  IsObject,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { TaskType } from '../../lessons/schemas/task.schema';

export class CreateTaskDto {
  @ApiProperty({ example: '64f8c1234567890abcdef789' })
  @IsString()
  @IsNotEmpty()
  lessonId: string;

  @ApiProperty({
    enum: TaskType,
    example: TaskType.MULTIPLE_CHOICE,
  })
  @IsEnum(TaskType)
  @IsNotEmpty()
  type: TaskType;

  @ApiProperty({ example: 1 })
  @IsNumber()
  order: number;

  @ApiPropertyOptional({ example: 'Reading Comprehension' })
  @IsOptional()
  @IsString()
  title?: string;

  @ApiPropertyOptional({ example: 'Choose the best answer' })
  @IsOptional()
  @IsString()
  description?: string;

  // Common fields
  @ApiPropertyOptional({ example: 'Discuss your favorite hobby' })
  @IsOptional()
  @IsString()
  textPrompt?: string;

  @ApiPropertyOptional({ example: 'https://example.com/image.jpg' })
  @IsOptional()
  @IsUrl()
  imageUrl?: string;

  @ApiPropertyOptional({ example: 'https://example.com/audio.mp3' })
  @IsOptional()
  @IsUrl()
  audioUrl?: string;

  // Listening MCQ / Multiple Choice fields
  @ApiPropertyOptional({
    example: ['Option A', 'Option B', 'Option C', 'Option D'],
  })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  options?: string[];

  @ApiPropertyOptional({ example: 2 })
  @IsOptional()
  @IsNumber()
  correctOptionIndex?: number;

  @ApiPropertyOptional({ example: [0, 2] })
  @IsOptional()
  @IsArray()
  @IsNumber({}, { each: true })
  correctOptionIndices?: number[];

  // Recording / Speaking fields
  @ApiPropertyOptional({ example: 'Record your answer' })
  @IsOptional()
  @IsString()
  promptText?: string;

  @ApiPropertyOptional({ example: 120, description: 'Duration in seconds' })
  @IsOptional()
  @IsNumber()
  maxDuration?: number;

  @ApiPropertyOptional({ example: 'https://example.com/sample.mp3' })
  @IsOptional()
  @IsUrl()
  sampleAnswerAudioUrl?: string;

  // Matching fields
  @ApiPropertyOptional({
    example: [
      { left: 'Apple', right: 'Fruit' },
      { left: 'Car', right: 'Vehicle' },
    ],
  })
  @IsOptional()
  @IsArray()
  pairs?: { left: string; right: string }[];

  @ApiPropertyOptional({ example: [{ leftIndex: 0, rightIndex: 1 }] })
  @IsOptional()
  @IsArray()
  correctPairs?: { leftIndex: number; rightIndex: number }[];

  // Ranking fields
  @ApiPropertyOptional({ example: ['Item 1', 'Item 2', 'Item 3'] })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  items?: string[];

  @ApiPropertyOptional({ example: [1, 0, 2] })
  @IsOptional()
  @IsArray()
  @IsNumber({}, { each: true })
  correctOrder?: number[];

  // Fill-in-the-Blank / Summary Cloze fields
  @ApiPropertyOptional({ example: 'The __1__ is __2__ today.' })
  @IsOptional()
  @IsString()
  textTemplate?: string;

  @ApiPropertyOptional({ example: ['weather', 'sunny', 'cold', 'rainy'] })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  wordBank?: string[];

  @ApiPropertyOptional({ example: { '1': 'weather', '2': 'sunny' } })
  @IsOptional()
  @IsObject()
  correctAnswers?: Record<string, string>;

  // True/False fields
  @ApiPropertyOptional({ example: ['Statement 1', 'Statement 2'] })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  statements?: string[];

  @ApiPropertyOptional({ example: [true, false] })
  @IsOptional()
  @IsArray()
  @IsBoolean({ each: true })
  correctFlags?: boolean[];

  // Drag-and-Drop fields
  @ApiPropertyOptional({ example: ['Category A', 'Category B'] })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  categories?: string[];

  @ApiPropertyOptional({
    example: {
      'Category A': ['item1', 'item2'],
      'Category B': ['item3'],
    },
  })
  @IsOptional()
  @IsObject()
  correctMapping?: Record<string, string[]>;

  // Paraphrase fields
  @ApiPropertyOptional({ example: 'Original sentence here' })
  @IsOptional()
  @IsString()
  baseSentence?: string;

  @ApiPropertyOptional({ example: 'Model answer here' })
  @IsOptional()
  @IsString()
  modelAnswer?: string;

  // Sentence Reordering fields
  @ApiPropertyOptional({ example: ['First', 'Second', 'Third'] })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  segments?: string[];

  // Speaking Part 2 fields
  @ApiPropertyOptional({ example: 'Describe a place you visited' })
  @IsOptional()
  @IsString()
  cueCardText?: string;

  @ApiPropertyOptional({ example: ['Where it is', 'When you visited'] })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  notesHint?: string[];

  // Speaking Part 3 fields
  @ApiPropertyOptional({ example: 'What are the benefits of technology?' })
  @IsOptional()
  @IsString()
  questionText?: string;

  @ApiPropertyOptional({ example: ['Point 1', 'Point 2'] })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  keyPoints?: string[];
}

export class UpdateTaskDto {
  @IsOptional()
  title?: string;

  @IsOptional()
  description?: string;

  @IsOptional()
  @IsEnum(TaskType)
  type?: TaskType;

  @IsOptional()
  order?: number;

  // All task-specific fields are optional for updates
  textPrompt?: string;
  imageUrl?: string;
  audioUrl?: string;
  options?: string[];
  correctOptionIndex?: number;
  correctOptionIndices?: number[];
  promptText?: string;
  maxDuration?: number;
  sampleAnswerAudioUrl?: string;
  pairs?: { left: string; right: string }[];
  correctPairs?: { leftIndex: number; rightIndex: number }[];
  items?: string[];
  correctOrder?: number[];
  textTemplate?: string;
  wordBank?: string[];
  correctAnswers?: Record<string, string>;
  statements?: string[];
  correctFlags?: boolean[];
  categories?: string[];
  correctMapping?: Record<string, string[]>;
  baseSentence?: string;
  modelAnswer?: string;
  segments?: string[];
  cueCardText?: string;
  notesHint?: string[];
  questionText?: string;
  keyPoints?: string[];
}

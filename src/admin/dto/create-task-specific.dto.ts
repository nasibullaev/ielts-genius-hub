import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsArray,
  IsNumber,
  IsString,
  IsBoolean,
  IsObject,
} from 'class-validator';
import { TaskType } from '../../lessons/schemas/task.schema';

// Base fields common to all task types
export class BaseTaskDto {
  @ApiProperty({ example: '64f8c1234567890abcdef789' })
  lessonId: string;

  @ApiProperty({ example: 1 })
  order: number;

  @ApiPropertyOptional({ example: 'Task Title' })
  title?: string;

  @ApiPropertyOptional({ example: 'Task Description' })
  description?: string;
}

// Lead-in Task DTO
export class LeadInTaskDto extends BaseTaskDto {
  @ApiProperty({ enum: [TaskType.LEAD_IN], example: TaskType.LEAD_IN })
  type: TaskType.LEAD_IN;

  @ApiPropertyOptional({ example: 'What comes to mind when you hear "IELTS"?' })
  textPrompt?: string;

  @ApiPropertyOptional({ example: '/uploads/tasks/image.jpg' })
  imageUrl?: string;
}

// Listening MCQ Task DTO
export class ListeningMcqTaskDto extends BaseTaskDto {
  @ApiProperty({
    enum: [TaskType.LISTENING_MCQ],
    example: TaskType.LISTENING_MCQ,
  })
  type: TaskType.LISTENING_MCQ;

  @ApiPropertyOptional({ example: '/uploads/tasks/audio.mp3' })
  audioUrl?: string;

  @ApiPropertyOptional({
    example: ['Option A', 'Option B', 'Option C', 'Option D'],
  })
  @IsArray()
  options?: string[];

  @ApiPropertyOptional({ example: 2 })
  @IsNumber()
  correctOptionIndex?: number;
}

// Recording Task DTO
export class RecordingTaskDto extends BaseTaskDto {
  @ApiProperty({ enum: [TaskType.RECORDING], example: TaskType.RECORDING })
  type: TaskType.RECORDING;

  @ApiPropertyOptional({ example: 'Describe your favorite hobby' })
  promptText?: string;

  @ApiPropertyOptional({ example: 120, description: 'Duration in seconds' })
  @IsNumber()
  maxDuration?: number;

  @ApiPropertyOptional({ example: '/uploads/tasks/sample.mp3' })
  sampleAnswerAudioUrl?: string;
}

// Matching Task DTO
export class MatchingTaskDto extends BaseTaskDto {
  @ApiProperty({ enum: [TaskType.MATCHING], example: TaskType.MATCHING })
  type: TaskType.MATCHING;

  @ApiPropertyOptional({ example: [{ left: 'Apple', right: 'Fruit' }] })
  @IsArray()
  pairs?: { left: string; right: string }[];

  @ApiPropertyOptional({ example: [{ leftIndex: 0, rightIndex: 0 }] })
  @IsArray()
  correctPairs?: { leftIndex: number; rightIndex: number }[];
}

// Ranking Task DTO
export class RankingTaskDto extends BaseTaskDto {
  @ApiProperty({ enum: [TaskType.RANKING], example: TaskType.RANKING })
  type: TaskType.RANKING;

  @ApiPropertyOptional({ example: ['Item 1', 'Item 2', 'Item 3'] })
  @IsArray()
  items?: string[];

  @ApiPropertyOptional({ example: [1, 0, 2] })
  @IsArray()
  correctOrder?: number[];
}

// Fill-in-Blank Task DTO
export class FillInBlankTaskDto extends BaseTaskDto {
  @ApiProperty({
    enum: [TaskType.FILL_IN_BLANK],
    example: TaskType.FILL_IN_BLANK,
  })
  type: TaskType.FILL_IN_BLANK;

  @ApiPropertyOptional({ example: 'The __1__ is __2__ today.' })
  textTemplate?: string;

  @ApiPropertyOptional({ example: ['weather', 'sunny', 'cold', 'rainy'] })
  @IsArray()
  wordBank?: string[];

  @ApiPropertyOptional({ example: { '1': 'weather', '2': 'sunny' } })
  @IsObject()
  correctAnswers?: Record<string, string>;
}

// Multiple Choice Task DTO
export class MultipleChoiceTaskDto extends BaseTaskDto {
  @ApiProperty({
    enum: [TaskType.MULTIPLE_CHOICE],
    example: TaskType.MULTIPLE_CHOICE,
  })
  type: TaskType.MULTIPLE_CHOICE;

  @ApiPropertyOptional({
    example: ['Option A', 'Option B', 'Option C', 'Option D'],
  })
  @IsArray()
  options?: string[];

  @ApiPropertyOptional({ example: [0, 2] })
  @IsArray()
  correctOptionIndices?: number[];
}

// True/False Task DTO
export class TrueFalseTaskDto extends BaseTaskDto {
  @ApiProperty({ enum: [TaskType.TRUE_FALSE], example: TaskType.TRUE_FALSE })
  type: TaskType.TRUE_FALSE;

  @ApiPropertyOptional({ example: ['Statement 1', 'Statement 2'] })
  @IsArray()
  statements?: string[];

  @ApiPropertyOptional({ example: [true, false] })
  @IsArray()
  correctFlags?: boolean[];
}

// Summary Cloze Task DTO
export class SummaryClozeTaskDto extends BaseTaskDto {
  @ApiProperty({
    enum: [TaskType.SUMMARY_CLOZE],
    example: TaskType.SUMMARY_CLOZE,
  })
  type: TaskType.SUMMARY_CLOZE;

  @ApiPropertyOptional({ example: 'The __1__ is __2__.' })
  textTemplate?: string;

  @ApiPropertyOptional({ example: ['word1', 'word2'] })
  @IsArray()
  wordBank?: string[];

  @ApiPropertyOptional({ example: { '1': 'word1', '2': 'word2' } })
  @IsObject()
  correctAnswers?: Record<string, string>;
}

// Drag-Drop Task DTO
export class DragDropTaskDto extends BaseTaskDto {
  @ApiProperty({ enum: [TaskType.DRAG_DROP], example: TaskType.DRAG_DROP })
  type: TaskType.DRAG_DROP;

  @ApiPropertyOptional({ example: ['Category A', 'Category B'] })
  @IsArray()
  categories?: string[];

  @ApiPropertyOptional({ example: { 'Category A': ['item1', 'item2'] } })
  @IsObject()
  correctMapping?: Record<string, string[]>;
}

// Paraphrase Task DTO
export class ParaphraseTaskDto extends BaseTaskDto {
  @ApiProperty({ enum: [TaskType.PARAPHRASE], example: TaskType.PARAPHRASE })
  type: TaskType.PARAPHRASE;

  @ApiPropertyOptional({ example: 'Original sentence here' })
  baseSentence?: string;

  @ApiPropertyOptional({ example: 'Model answer here' })
  modelAnswer?: string;
}

// Sentence Reordering Task DTO
export class SentenceReorderingTaskDto extends BaseTaskDto {
  @ApiProperty({
    enum: [TaskType.SENTENCE_REORDERING],
    example: TaskType.SENTENCE_REORDERING,
  })
  type: TaskType.SENTENCE_REORDERING;

  @ApiPropertyOptional({ example: ['First', 'Second', 'Third'] })
  @IsArray()
  segments?: string[];

  @ApiPropertyOptional({ example: [1, 0, 2] })
  @IsArray()
  correctOrder?: number[];
}

// Speaking Part 2 Task DTO
export class SpeakingPart2TaskDto extends BaseTaskDto {
  @ApiProperty({
    enum: [TaskType.SPEAKING_PART2_CUE_CARD],
    example: TaskType.SPEAKING_PART2_CUE_CARD,
  })
  type: TaskType.SPEAKING_PART2_CUE_CARD;

  @ApiPropertyOptional({ example: 'Describe a place you visited' })
  cueCardText?: string;

  @ApiPropertyOptional({ example: ['Where it is', 'When you visited'] })
  @IsArray()
  notesHint?: string[];

  @ApiPropertyOptional({ example: '/uploads/tasks/sample.mp3' })
  sampleAnswerAudioUrl?: string;
}

// Speaking Part 3 Task DTO
export class SpeakingPart3TaskDto extends BaseTaskDto {
  @ApiProperty({
    enum: [TaskType.SPEAKING_PART3_DISCUSSION],
    example: TaskType.SPEAKING_PART3_DISCUSSION,
  })
  type: TaskType.SPEAKING_PART3_DISCUSSION;

  @ApiPropertyOptional({ example: 'What are the benefits of technology?' })
  questionText?: string;

  @ApiPropertyOptional({ example: ['Point 1', 'Point 2'] })
  @IsArray()
  keyPoints?: string[];

  @ApiPropertyOptional({ example: 'Model answer here' })
  modelAnswer?: string;
}

import {
  IsArray,
  ArrayMinSize,
  ValidateNested,
  IsString,
  IsNotEmpty,
  IsNumber,
  Min,
  Max,
  ArrayMaxSize,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';

export class BulkQuizQuestionDto {
  @ApiProperty({
    example: 'What is the main purpose of IELTS Speaking Part 1?',
  })
  @IsString()
  @IsNotEmpty()
  question: string;

  @ApiProperty({
    example: [
      'To test grammar knowledge',
      'To assess personal communication',
      'To evaluate writing skills',
      'To check vocabulary',
    ],
    description: 'Array of exactly 4 options',
  })
  @IsArray()
  @ArrayMinSize(4)
  @ArrayMaxSize(4)
  @IsString({ each: true })
  options: string[];

  @ApiProperty({
    example: 1,
    description: 'Index of correct answer (0-3)',
    minimum: 0,
    maximum: 3,
  })
  @IsNumber()
  @Min(0)
  @Max(3)
  correctOptionIndex: number;

  @ApiProperty({ example: 1 })
  @IsNumber()
  order: number;
}

export class CreateBulkQuestionsDto {
  @ApiProperty({
    type: [BulkQuizQuestionDto],
    description: 'Array of questions to create (max 50 at once)',
    example: [
      {
        question: 'What is the main purpose of IELTS Speaking Part 1?',
        options: [
          'To test grammar knowledge',
          'To assess personal communication',
          'To evaluate writing skills',
          'To check vocabulary',
        ],
        correctOptionIndex: 1,
        order: 1,
      },
      {
        question: 'How long should you speak for each Part 1 question?',
        options: [
          '30 seconds to 1 minute',
          '1-2 minutes',
          '2-3 minutes',
          'As long as possible',
        ],
        correctOptionIndex: 0,
        order: 2,
      },
    ],
  })
  @IsArray()
  @ArrayMinSize(1)
  @ArrayMaxSize(50) // Reasonable limit
  @ValidateNested({ each: true })
  @Type(() => BulkQuizQuestionDto)
  questions: BulkQuizQuestionDto[];
}

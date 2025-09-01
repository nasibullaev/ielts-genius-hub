// src/admin/dto/create-quiz-question.dto.ts
import {
  IsString,
  IsNotEmpty,
  IsArray,
  ArrayMinSize,
  ArrayMaxSize,
  IsNumber,
  Min,
  Max,
} from 'class-validator';
import { ApiProperty, PartialType } from '@nestjs/swagger';

export class CreateQuizQuestionDto {
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

export class UpdateQuizQuestionDto extends PartialType(CreateQuizQuestionDto) {
  // All fields optional for updates
  question?: string;
  options?: string[];
  correctOptionIndex?: number;
  order?: number;
}

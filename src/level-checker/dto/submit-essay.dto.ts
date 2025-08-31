// src/level-checker/dto/submit-essay.dto.ts
import {
  IsString,
  IsNotEmpty,
  MinLength,
  IsNumber,
  Min,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class SubmitEssayDto {
  @ApiProperty({
    example:
      'Some people believe that universities should require every student to take a variety of courses outside their major field of study...',
    description: 'The writing topic that was provided',
  })
  @IsString()
  @IsNotEmpty()
  topic: string;

  @ApiProperty({
    example:
      "In today's rapidly evolving educational landscape, there is an ongoing debate about whether universities should mandate students to take diverse courses beyond their major...",
    description: 'The essay written by the student (minimum 150 words)',
  })
  @IsString()
  @IsNotEmpty()
  @MinLength(150, { message: 'Essay must be at least 150 words' })
  essay: string;

  @ApiProperty({
    example: 25,
    description: 'Time spent writing the essay in minutes',
  })
  @IsNumber()
  @Min(1)
  timeSpent: number;
}

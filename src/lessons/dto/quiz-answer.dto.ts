// src/lessons/dto/quiz-answer.dto.ts
import { IsArray, IsNumber, Min, Max } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class QuizAnswerDto {
  @ApiProperty({
    example: [0, 2, 1, 3],
    description: 'Array of selected option indices for each question',
  })
  @IsArray()
  @IsNumber({}, { each: true })
  @Min(0, { each: true })
  @Max(3, { each: true })
  answers: number[];
}

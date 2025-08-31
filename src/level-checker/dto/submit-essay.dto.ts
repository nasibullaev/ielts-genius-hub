// src/level-checker/dto/submit-essay.dto.ts
import { IsString, IsNotEmpty, MinLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class SubmitEssayDto {
  @ApiProperty({
    example:
      'Some people believe that universities should require every student to take a variety of courses outside their major field of study. Others believe that universities should not force students to take any courses other than those that will help prepare them for jobs in their chosen fields. Discuss both views and give your own opinion.',
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
}

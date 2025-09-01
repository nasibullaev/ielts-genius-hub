import { IsString, IsNotEmpty, IsEnum, IsOptional } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateCourseDto {
  @ApiProperty({ example: 'IELTS Speaking Mastery' })
  @IsString()
  @IsNotEmpty()
  title: string;

  @ApiProperty({
    example: 'Complete IELTS Speaking preparation course with practice tests',
  })
  @IsString()
  @IsNotEmpty()
  description: string;

  @ApiProperty({ example: '15 hours' })
  @IsString()
  @IsNotEmpty()
  duration: string;

  @ApiProperty({
    example: 'Intermediate',
    enum: ['Beginner', 'Intermediate', 'Advanced'],
  })
  @IsEnum(['Beginner', 'Intermediate', 'Advanced'])
  level: string;

  // Remove picture from DTO - it will be handled by file upload
}

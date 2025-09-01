import {
  IsString,
  IsNotEmpty,
  IsNumber,
  IsEnum,
  IsOptional,
  IsUrl,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional, PartialType } from '@nestjs/swagger';

export class CreateLessonDto {
  @ApiProperty({ example: 'Introduction Video' })
  @IsString()
  @IsNotEmpty()
  title: string;

  @ApiProperty({ example: 'Overview of Speaking Part 1' })
  @IsString()
  description: string;

  @ApiProperty({ example: '64f8c1234567890abcdef789' })
  @IsString()
  @IsNotEmpty()
  sectionId: string;

  @ApiProperty({ enum: ['Video', 'Text', 'Quiz', 'File'] })
  @IsEnum(['Video', 'Text', 'Quiz', 'File'])
  type: string;

  @ApiProperty({ example: 1 })
  @IsNumber()
  order: number;

  @ApiPropertyOptional({ example: 'https://www.youtube.com/watch?v=example' })
  @IsOptional()
  @IsUrl()
  videoUrl?: string;

  @ApiPropertyOptional({
    example: '<h2>Speaking Tips</h2><p>Here are the key strategies...</p>',
  })
  @IsOptional()
  @IsString()
  textContent?: string;

  @ApiPropertyOptional({ example: '/uploads/files/speaking-templates.pdf' })
  @IsOptional()
  @IsString()
  fileUrl?: string;

  @ApiPropertyOptional({ example: 'IELTS Speaking Templates.pdf' })
  @IsOptional()
  @IsString()
  fileName?: string;
}

export class UpdateLessonDto extends PartialType(CreateLessonDto) {
  // All fields are optional for updates
  @IsOptional()
  title?: string;

  @IsOptional()
  description?: string;

  @IsOptional()
  sectionId?: string;

  @IsOptional()
  type?: string;

  @IsOptional()
  order?: number;
}

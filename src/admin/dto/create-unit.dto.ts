// src/admin/dto/create-unit.dto.ts
import { IsString, IsNotEmpty, IsNumber } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateUnitDto {
  @ApiProperty({ example: 'Introduction to IELTS Speaking' })
  @IsString()
  @IsNotEmpty()
  title: string;

  @ApiProperty({ example: 'Basic concepts and structure' })
  @IsString()
  description: string;

  @ApiProperty({ example: '64f8a1234567890abcdef123' })
  @IsString()
  @IsNotEmpty()
  courseId: string;

  @ApiProperty({ example: 1 })
  @IsNumber()
  order: number;
}

export class UpdateUnitDto {
  @ApiProperty({ required: false })
  @IsString()
  @IsNotEmpty()
  title?: string;

  @ApiProperty({ required: false })
  @IsString()
  description?: string;

  @ApiProperty({ required: false })
  @IsNumber()
  order?: number;
}

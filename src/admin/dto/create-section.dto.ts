// src/admin/dto/create-section.dto.ts
import { IsString, IsNotEmpty, IsNumber } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateSectionDto {
  @ApiProperty({ example: 'Speaking Part 1 - Personal Questions' })
  @IsString()
  @IsNotEmpty()
  title: string;

  @ApiProperty({ example: 'Learn how to answer personal questions' })
  @IsString()
  description: string;

  @ApiProperty({ example: '64f8b1234567890abcdef456' })
  @IsString()
  @IsNotEmpty()
  unitId: string;

  @ApiProperty({ example: 1 })
  @IsNumber()
  order: number;
}

export class UpdateSectionDto {
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

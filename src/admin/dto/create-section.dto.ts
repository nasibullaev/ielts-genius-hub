import {
  IsString,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsArray,
  ValidateNested,
  ArrayMinSize,
  ArrayMaxSize,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';

export class PresentationDto {
  @ApiProperty({ example: 'Key Speaking Strategies' })
  @IsString()
  @IsNotEmpty()
  title: string;

  @ApiProperty({
    example: [
      'Understand the question quickly',
      'Structure answers clearly',
    ],
    type: [String],
  })
  @IsArray()
  @ArrayMinSize(2)
  @ArrayMaxSize(2)
  @IsString({ each: true })
  cards: string[];
}

export class QuickTipsDto {
  @ApiProperty({
    example: [
      'Practice aloud daily',
      'Record yourself and review',
      'Use timers to simulate exam conditions',
      'Reflect on strengths and weaknesses',
    ],
    type: [String],
  })
  @IsArray()
  @ArrayMinSize(4)
  @ArrayMaxSize(4)
  @IsString({ each: true })
  cards: string[];
}

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

  @ApiProperty({ example: '/uploads/sections/intro.png', required: false })
  @IsString()
  @IsOptional()
  image?: string;

  @ApiProperty({
    example: ['Understand question types', 'Practice sample answers'],
    required: false,
    type: [String],
  })
  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  sessionPlans?: string[];

  @ApiProperty({ required: false, type: () => PresentationDto })
  @ValidateNested()
  @Type(() => PresentationDto)
  @IsOptional()
  presentation?: PresentationDto;

  @ApiProperty({ required: false, type: () => QuickTipsDto })
  @ValidateNested()
  @Type(() => QuickTipsDto)
  @IsOptional()
  quickTips?: QuickTipsDto;
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

  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  image?: string;

  @ApiProperty({ required: false, type: [String] })
  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  sessionPlans?: string[];

  @ApiProperty({ required: false, type: () => PresentationDto })
  @ValidateNested()
  @Type(() => PresentationDto)
  @IsOptional()
  presentation?: PresentationDto;

  @ApiProperty({ required: false, type: () => QuickTipsDto })
  @ValidateNested()
  @Type(() => QuickTipsDto)
  @IsOptional()
  quickTips?: QuickTipsDto;
}

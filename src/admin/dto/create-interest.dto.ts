import { IsString, IsNotEmpty, IsOptional } from 'class-validator';
import { ApiProperty, ApiPropertyOptional, PartialType } from '@nestjs/swagger';

export class CreateInterestDto {
  @ApiProperty({ example: 'IELTS Speaking' })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiPropertyOptional({
    example: 'true',
    default: 'true',
    description: 'Boolean value as string (true/false or 1/0)',
  })
  @IsOptional()
  @IsString()
  isActive?: string;
}

export class UpdateInterestDto extends PartialType(CreateInterestDto) {
  @IsOptional()
  name?: string;

  @IsOptional()
  icon?: string;

  @IsOptional()
  isActive?: string;
}

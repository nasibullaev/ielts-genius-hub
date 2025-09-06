import { IsArray, ArrayMinSize, ArrayMaxSize, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class SelectInterestsDto {
  @ApiProperty({
    example: [
      '64f8a1234567890abcdef123',
      '64f8a1234567890abcdef124',
      '64f8a1234567890abcdef125',
    ],
    description: 'Array of interest IDs (minimum 1, maximum 3)',
  })
  @IsArray()
  @ArrayMinSize(1, { message: 'Please select at least 1 interest' })
  @ArrayMaxSize(3, { message: 'You can select maximum 3 interests' })
  @IsString({ each: true })
  interestIds: string[];
}

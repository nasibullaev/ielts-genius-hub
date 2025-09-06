import { IsArray, IsNotEmpty, ArrayMaxSize, IsMongoId } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class UpdateInterestsDto {
  @ApiProperty({
    example: ['68bbf88787a1e5dce79068d5', '68bbf88787a1e5dce79068d6'],
    description: 'Array of interest IDs (maximum 3)',
    type: [String],
  })
  @IsArray()
  @ArrayMaxSize(3, { message: 'You can select maximum 3 interests' })
  @IsMongoId({
    each: true,
    message: 'Each interest must be a valid MongoDB ObjectId',
  })
  @IsNotEmpty({ each: true })
  interests: string[];
}

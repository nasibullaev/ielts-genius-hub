import { IsString, IsNotEmpty, IsNumber, Min, Matches } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreatePaymentDto {
  @ApiProperty({ example: '4532123456789012' })
  @IsString()
  @IsNotEmpty()
  @Matches(/^\d{13,19}$/, { message: 'Card number must be 13-19 digits' })
  cardNumber: string;

  @ApiProperty({ example: '12/25' })
  @IsString()
  @IsNotEmpty()
  @Matches(/^(0[1-9]|1[0-2])\/\d{2}$/, {
    message: 'Expiry must be MM/YY format',
  })
  expiryDate: string;

  @ApiProperty({ example: '123' })
  @IsString()
  @IsNotEmpty()
  @Matches(/^\d{3,4}$/, { message: 'CVV must be 3-4 digits' })
  cvv: string;

  @ApiProperty({ example: 'John Doe' })
  @IsString()
  @IsNotEmpty()
  cardHolderName: string;

  @ApiProperty({ example: 99.99 })
  @IsNumber()
  @Min(1)
  amount: number;
}

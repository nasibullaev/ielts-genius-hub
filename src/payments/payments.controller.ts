import {
  Controller,
  Post,
  Get,
  Body,
  UseGuards,
  Request,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiProperty,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { PaymentsService } from './payments.service';
import { CreatePaymentDto } from './dto/payment.dto';

export class PaymentResponseDto {
  @ApiProperty({ example: true })
  success: boolean;

  @ApiProperty({ example: 'Payment processed successfully' })
  message: string;

  @ApiProperty({ example: 'TXN_1693492800_abc123def' })
  transactionId: string;

  @ApiProperty({ example: '2024-09-30T12:00:00.000Z' })
  subscriptionExpiry: Date;
}

@ApiTags('payments')
@Controller('payments')
export class PaymentsController {
  constructor(private readonly paymentsService: PaymentsService) {}

  @Post('process')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Process payment (Mock)',
    description:
      'Mock payment processing - always succeeds and grants 1 month access',
  })
  @ApiResponse({
    status: 200,
    description: 'Payment processed successfully',
    type: PaymentResponseDto,
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async processPayment(@Request() req, @Body() paymentDto: CreatePaymentDto) {
    return this.paymentsService.processPayment(req.user.sub, paymentDto);
  }

  @Get('history')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get payment history' })
  @ApiResponse({ status: 200, description: 'Payment history retrieved' })
  async getHistory(@Request() req) {
    return this.paymentsService.getPaymentHistory(req.user.sub);
  }
}

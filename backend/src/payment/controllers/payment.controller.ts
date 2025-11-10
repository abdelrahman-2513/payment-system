import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  UseGuards,
  HttpStatus,
  HttpCode,
  Query,
  Patch,
} from '@nestjs/common';
import { PaymentService } from '../services/payment.service';
import { 
  CreatePaymentDto, 
  PaymentResponseDto, 
  CapturePaymentDto, 
  RefundPaymentDto 
} from '../dtos';
import { CurrentUser } from '../../shared/decorators';
import { Public } from '../../auth/decorators';
import { ATPayload } from 'src/shared/types';

@Controller('payments')
export class PaymentController {
  constructor(private readonly paymentService: PaymentService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  async createPayment(
    @CurrentUser() user: ATPayload,
    @Body() createPaymentDto: CreatePaymentDto,
  ): Promise<PaymentResponseDto> {
    return await this.paymentService.createPayment(user.id, createPaymentDto);
  }

  @Get()
  async findAll(): Promise<PaymentResponseDto[]> {
    return await this.paymentService.findAll();
  }

  @Get('my-payments')
  async getMyPayments(@CurrentUser() user: ATPayload): Promise<PaymentResponseDto[]> {
    return await this.paymentService.findByUserId(user.id);
  }

  @Get('methods')
  @Public()
  async getSupportedMethods(): Promise<{ methods: string[] }> {
    const methods = this.paymentService.getSupportedMethods();
    return { methods };
  }

  @Get(':id')
  async findById(@Param('id') id: string): Promise<PaymentResponseDto> {
    return await this.paymentService.findById(id);
  }

  @Get('reference/:reference')
  async findByReference(@Param('reference') reference: string): Promise<PaymentResponseDto> {
    return await this.paymentService.findByPaymentReference(reference);
  }

  @Get('order/:orderId')
  async findByOrderId(@Param('orderId') orderId: string): Promise<PaymentResponseDto[]> {
    return await this.paymentService.findByOrderId(orderId);
  }

  @Patch(':id/authorize')
  async authorizePayment(@Param('id') id: string): Promise<PaymentResponseDto> {
    return await this.paymentService.authorizePayment(id);
  }

  @Patch(':id/capture')
  async capturePayment(
    @Param('id') id: string,
    @Body() capturePaymentDto: CapturePaymentDto,
  ): Promise<PaymentResponseDto> {
    return await this.paymentService.capturePayment(id, capturePaymentDto.amount);
  }

  @Patch(':id/cancel')
  async cancelPayment(@Param('id') id: string): Promise<PaymentResponseDto> {
    return await this.paymentService.cancelPayment(id);
  }

  @Patch(':id/refund')
  async refundPayment(
    @Param('id') id: string,
    @Body() refundPaymentDto: RefundPaymentDto,
  ): Promise<PaymentResponseDto> {
    return await this.paymentService.refundPayment(
      id, 
      refundPaymentDto.amount, 
      refundPaymentDto.reason
    );
  }

  @Post('webhook/tamara')
  @Public()
  @HttpCode(HttpStatus.OK)
  async tamaraWebhook(
    @Query('tamaraToken') token: string,
    @Body() payload: any,
  ): Promise<{ message: string }> {
    await this.paymentService.handleWebhook('tamara', token, payload);
    return { message: 'Webhook processed successfully' };
  }

  @Post('webhook/:paymentMethod')
  @Public()
  @HttpCode(HttpStatus.OK)
  async genericWebhook(
    @Param('paymentMethod') paymentMethod: string,
    @Query('token') token: string,
    @Body() payload: any,
  ): Promise<{ message: string }> {
    await this.paymentService.handleWebhook(paymentMethod, token, payload);
    return { message: 'Webhook processed successfully' };
  }
}


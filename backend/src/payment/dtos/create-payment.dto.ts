import { IsString, IsNumber, IsOptional, IsPositive, IsUrl } from 'class-validator';

export class CreatePaymentDto {
  @IsString()
  orderId: string;

  @IsString()
  paymentMethod: string; // 'tamara', 'stripe', etc.

  @IsNumber()
  @IsPositive()
  amount: number;

  @IsString()
  @IsOptional()
  currency?: string;

  @IsString()
  @IsUrl()
  @IsOptional()
  successUrl?: string;

  @IsString()
  @IsUrl()
  @IsOptional()
  failureUrl?: string;

  @IsString()
  @IsUrl()
  @IsOptional()
  cancelUrl?: string;

  @IsOptional()
  metadata?: any;
}


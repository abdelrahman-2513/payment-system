import { IsNumber, IsOptional, IsPositive, IsString } from 'class-validator';

export class RefundPaymentDto {
  @IsNumber()
  @IsPositive()
  @IsOptional()
  amount?: number; // Optional: for partial refund

  @IsString()
  @IsOptional()
  reason?: string;
}


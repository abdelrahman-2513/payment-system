import { IsNumber, IsOptional, IsPositive, IsString } from 'class-validator';

export class CapturePaymentDto {
  @IsNumber()
  @IsPositive()
  @IsOptional()
  amount?: number; // Optional: for partial capture

  @IsString()
  @IsOptional()
  notes?: string;
}


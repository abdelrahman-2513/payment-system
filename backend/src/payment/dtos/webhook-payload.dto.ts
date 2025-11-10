import { IsString, IsOptional } from 'class-validator';

export class WebhookPayloadDto {
  @IsString()
  orderId: string;

  @IsString()
  eventType: string;

  @IsOptional()
  data?: any;
}


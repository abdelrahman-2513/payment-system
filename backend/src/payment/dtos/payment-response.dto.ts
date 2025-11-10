import { PaymentStatus } from '../../shared/enums';

export class PaymentResponseDto {
  id: string;
  paymentReference: string;
  orderId: string;
  userId: string;
  paymentMethod: string;
  status: PaymentStatus;
  amount: number;
  currency: string;
  externalPaymentId?: string;
  checkoutUrl?: string;
  successUrl?: string;
  failureUrl?: string;
  cancelUrl?: string;
  metadata?: any;
  errorMessage?: string;
  authorizedAt?: Date;
  capturedAt?: Date;
  refundedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}


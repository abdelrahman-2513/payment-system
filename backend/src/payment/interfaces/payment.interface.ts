import { PaymentStatus } from '../../shared/enums';

export interface IPayment {
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
  metadata?: any;
  createdAt: Date;
  updatedAt: Date;
}


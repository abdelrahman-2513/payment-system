import { Payment } from '../entities/payment.entity';
import { Order } from '../../order/entities/order.entity';

export interface IPaymentStrategy {
  createCheckout(payment: Payment, order: Order): Promise<{ checkoutUrl: string; externalPaymentId: string }>;
  authorize(payment: Payment): Promise<void>;
  capture(payment: Payment, amount?: number): Promise<void>;
  cancel(payment: Payment): Promise<void>;
  refund(payment: Payment, amount?: number, reason?: string): Promise<void>;
  getStatus(externalPaymentId: string): Promise<string>;
  verifyWebhook(token: string): Promise<boolean>;
}


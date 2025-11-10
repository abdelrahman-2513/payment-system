import { Injectable, BadRequestException } from '@nestjs/common';
import { IPaymentStrategy } from '../interfaces/payment-strategy.interface';
import { TamaraPaymentStrategy } from '../strategies/tamara-payment.strategy';

@Injectable()
export class PaymentStrategyFactory {
  constructor(
    private readonly tamaraStrategy: TamaraPaymentStrategy,
  ) {}

  getStrategy(paymentMethod: string): IPaymentStrategy {
    switch (paymentMethod.toLowerCase()) {
      case 'tamara':
        return this.tamaraStrategy;
      
      default:
        throw new BadRequestException(`Payment method '${paymentMethod}' is not supported`);
    }
  }

  getSupportedMethods(): string[] {
    return ['tamara'];
  }
}


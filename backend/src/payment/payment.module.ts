import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Payment } from './entities/payment.entity';
import { PaymentController } from './controllers/payment.controller';
import { PaymentService } from './services/payment.service';
import { PaymentRepository } from './repositories/payment.repository';
import { PaymentStrategyFactory } from './factories/payment-strategy.factory';
import { TamaraPaymentStrategy } from './strategies/tamara-payment.strategy';
import { OrderModule } from '../order/order.module';
import { ConfigModule } from '../config/config.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Payment]),
    OrderModule,
    ConfigModule,
  ],
  controllers: [PaymentController],
  providers: [
    PaymentService,
    PaymentRepository,
    PaymentStrategyFactory,
    TamaraPaymentStrategy,
  ],
  exports: [PaymentService, PaymentRepository],
})
export class PaymentModule {}


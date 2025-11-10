import { Injectable, NotFoundException, BadRequestException, Logger } from '@nestjs/common';
import { PaymentRepository } from '../repositories/payment.repository';
import { OrderRepository } from '../../order/repositories/order.repository';
import { PaymentStrategyFactory } from '../factories/payment-strategy.factory';
import { CreatePaymentDto, PaymentResponseDto } from '../dtos';
import { Payment } from '../entities/payment.entity';
import { PaymentStatus, OrderStatus } from '../../shared/enums';

@Injectable()
export class PaymentService {
  private readonly logger = new Logger(PaymentService.name);

  constructor(
    private readonly paymentRepository: PaymentRepository,
    private readonly orderRepository: OrderRepository,
    private readonly strategyFactory: PaymentStrategyFactory,
  ) {}

  private async generatePaymentReference(): Promise<string> {
    const timestamp = Date.now();
    const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
    return `PAY-${timestamp}-${random}`;
  }

  async createPayment(userId: string, createPaymentDto: CreatePaymentDto): Promise<PaymentResponseDto> {
    const { orderId, paymentMethod, amount, currency = 'SAR', ...paymentData } = createPaymentDto;

    const order = await this.orderRepository.findById(orderId);
    if (!order) {
      throw new NotFoundException(`Order with ID ${orderId} not found`);
    }

    if (order.userId !== userId) {
      throw new BadRequestException('You can only create payments for your own orders');
    }

    const existingPayments = await this.paymentRepository.findByOrderId(orderId);
    const hasSuccessfulPayment = existingPayments.some(
      p => p.status === PaymentStatus.CAPTURED || p.status === PaymentStatus.AUTHORIZED
    );

    if (hasSuccessfulPayment) {
      throw new BadRequestException('Order already has a successful payment');
    }

    const paymentReference = await this.generatePaymentReference();

    const payment = await this.paymentRepository.create({
      paymentReference,
      orderId,
      userId,
      paymentMethod: paymentMethod.toLowerCase(),
      status: PaymentStatus.PENDING,
      amount,
      currency,
      ...paymentData,
    });

    try {
      const strategy = this.strategyFactory.getStrategy(paymentMethod);

      const { checkoutUrl, externalPaymentId } = await strategy.createCheckout(payment, order);

      const updatedPayment = await this.paymentRepository.update(payment.id, {
        checkoutUrl,
        externalPaymentId,
      });

      await this.orderRepository.update(orderId, {
        status: OrderStatus.AWAITING_PAYMENT,
      });

      this.logger.log(`Payment ${paymentReference} created successfully for order ${order.orderNumber}`);

      return this.mapToResponseDto(updatedPayment);
    } catch (error) {
      await this.paymentRepository.update(payment.id, {
        status: PaymentStatus.FAILED,
        errorMessage: error.message,
      });

      this.logger.error(`Failed to create payment: ${error.message}`);
      throw error;
    }
  }

  async authorizePayment(paymentId: string): Promise<PaymentResponseDto> {
    const payment = await this.paymentRepository.findById(paymentId);
    if (!payment) {
      throw new NotFoundException(`Payment with ID ${paymentId} not found`);
    }

    if (payment.status !== PaymentStatus.PENDING) {
      throw new BadRequestException(`Payment is not in pending status`);
    }

    try {
      const strategy = this.strategyFactory.getStrategy(payment.paymentMethod);
      await strategy.authorize(payment);

      const updatedPayment = await this.paymentRepository.update(paymentId, {
        status: PaymentStatus.AUTHORIZED,
        authorizedAt: new Date(),
      });

      // Update order status
      await this.orderRepository.update(payment.orderId, {
        status: OrderStatus.PAYMENT_AUTHORIZED,
      });

      this.logger.log(`Payment ${payment.paymentReference} authorized successfully`);

      return this.mapToResponseDto(updatedPayment);
    } catch (error) {
      await this.paymentRepository.update(paymentId, {
        status: PaymentStatus.FAILED,
        errorMessage: error.message,
      });

      this.logger.error(`Failed to authorize payment: ${error.message}`);
      throw error;
    }
  }

  async capturePayment(paymentId: string, amount?: number): Promise<PaymentResponseDto> {
    const payment = await this.paymentRepository.findById(paymentId);
    if (!payment) {
      throw new NotFoundException(`Payment with ID ${paymentId} not found`);
    }

    if (payment.status !== PaymentStatus.AUTHORIZED && payment.status !== PaymentStatus.PENDING) {
      throw new BadRequestException(`Payment must be authorized before capture`);
    }

    try {
      const strategy = this.strategyFactory.getStrategy(payment.paymentMethod);
      await strategy.capture(payment, amount);

      const updatedPayment = await this.paymentRepository.update(paymentId, {
        status: PaymentStatus.CAPTURED,
        capturedAt: new Date(),
      });

      // Update order status
      await this.orderRepository.update(payment.orderId, {
        status: OrderStatus.PROCESSING,
      });

      this.logger.log(`Payment ${payment.paymentReference} captured successfully`);

      return this.mapToResponseDto(updatedPayment);
    } catch (error) {
      await this.paymentRepository.update(paymentId, {
        status: PaymentStatus.FAILED,
        errorMessage: error.message,
      });

      this.logger.error(`Failed to capture payment: ${error.message}`);
      throw error;
    }
  }

  async cancelPayment(paymentId: string): Promise<PaymentResponseDto> {
    const payment = await this.paymentRepository.findById(paymentId);
    if (!payment) {
      throw new NotFoundException(`Payment with ID ${paymentId} not found`);
    }

    if (payment.status === PaymentStatus.CAPTURED) {
      throw new BadRequestException(`Cannot cancel a captured payment. Use refund instead.`);
    }

    if (payment.status === PaymentStatus.CANCELLED) {
      throw new BadRequestException(`Payment is already cancelled`);
    }

    try {
      const strategy = this.strategyFactory.getStrategy(payment.paymentMethod);
      await strategy.cancel(payment);

      const updatedPayment = await this.paymentRepository.update(paymentId, {
        status: PaymentStatus.CANCELLED,
      });

      // Update order status
      await this.orderRepository.update(payment.orderId, {
        status: OrderStatus.CANCELLED,
      });

      this.logger.log(`Payment ${payment.paymentReference} cancelled successfully`);

      return this.mapToResponseDto(updatedPayment);
    } catch (error) {
      this.logger.error(`Failed to cancel payment: ${error.message}`);
      throw error;
    }
  }

  async refundPayment(paymentId: string, amount?: number, reason?: string): Promise<PaymentResponseDto> {
    const payment = await this.paymentRepository.findById(paymentId);
    if (!payment) {
      throw new NotFoundException(`Payment with ID ${paymentId} not found`);
    }

    if (payment.status !== PaymentStatus.CAPTURED) {
      throw new BadRequestException(`Can only refund captured payments`);
    }

    try {
      const strategy = this.strategyFactory.getStrategy(payment.paymentMethod);
      await strategy.refund(payment, amount, reason);

      const isPartialRefund = amount && amount < payment.amount;
      const updatedPayment = await this.paymentRepository.update(paymentId, {
        status: isPartialRefund ? PaymentStatus.PARTIALLY_REFUNDED : PaymentStatus.REFUNDED,
        refundedAt: new Date(),
      });

      // Update order status
      await this.orderRepository.update(payment.orderId, {
        status: isPartialRefund ? OrderStatus.PARTIALLY_REFUNDED : OrderStatus.REFUNDED,
      });

      this.logger.log(`Payment ${payment.paymentReference} refunded successfully`);

      return this.mapToResponseDto(updatedPayment);
    } catch (error) {
      this.logger.error(`Failed to refund payment: ${error.message}`);
      throw error;
    }
  }

  async findAll(): Promise<PaymentResponseDto[]> {
    const payments = await this.paymentRepository.findAll();
    return payments.map(payment => this.mapToResponseDto(payment));
  }

  async findByUserId(userId: string): Promise<PaymentResponseDto[]> {
    const payments = await this.paymentRepository.findByUserId(userId);
    return payments.map(payment => this.mapToResponseDto(payment));
  }

  async findByOrderId(orderId: string): Promise<PaymentResponseDto[]> {
    const payments = await this.paymentRepository.findByOrderId(orderId);
    return payments.map(payment => this.mapToResponseDto(payment));
  }

  async findById(id: string): Promise<PaymentResponseDto> {
    const payment = await this.paymentRepository.findById(id);
    if (!payment) {
      throw new NotFoundException(`Payment with ID ${id} not found`);
    }
    return this.mapToResponseDto(payment);
  }

  async findByPaymentReference(paymentReference: string): Promise<PaymentResponseDto> {
    const payment = await this.paymentRepository.findByPaymentReference(paymentReference);
    if (!payment) {
      throw new NotFoundException(`Payment with reference ${paymentReference} not found`);
    }
    return this.mapToResponseDto(payment);
  }

  async handleWebhook(paymentMethod: string, token: string, payload: any): Promise<void> {
    try {
      const strategy = this.strategyFactory.getStrategy(paymentMethod);

      const isValid = await strategy.verifyWebhook(token);
      if (!isValid) {
        throw new BadRequestException('Invalid webhook signature');
      }

      const payment = await this.paymentRepository.findByExternalPaymentId(payload.order_id);
      if (!payment) {
        this.logger.warn(`Payment not found for external ID: ${payload.order_id}`);
        return;
      }

      const statusMap = {
        'approved': PaymentStatus.AUTHORIZED,
        'captured': PaymentStatus.CAPTURED,
        'declined': PaymentStatus.FAILED,
        'expired': PaymentStatus.CANCELLED,
        'canceled': PaymentStatus.CANCELLED,
      };

      const newStatus = statusMap[payload.order_status?.toLowerCase()] || payment.status;
      
      if (newStatus !== payment.status) {
        await this.paymentRepository.update(payment.id, {
          status: newStatus,
          authorizedAt: newStatus === PaymentStatus.AUTHORIZED ? new Date() : payment.authorizedAt,
          capturedAt: newStatus === PaymentStatus.CAPTURED ? new Date() : payment.capturedAt,
        });

        this.logger.log(`Payment ${payment.paymentReference} status updated to ${newStatus} via webhook`);
      }
    } catch (error) {
      this.logger.error(`Webhook processing failed: ${error.message}`);
      throw error;
    }
  }

  getSupportedMethods(): string[] {
    return this.strategyFactory.getSupportedMethods();
  }

  private mapToResponseDto(payment: Payment): PaymentResponseDto {
    return {
      id: payment.id,
      paymentReference: payment.paymentReference,
      orderId: payment.orderId,
      userId: payment.userId,
      paymentMethod: payment.paymentMethod,
      status: payment.status,
      amount: Number(payment.amount),
      currency: payment.currency,
      externalPaymentId: payment.externalPaymentId,
      checkoutUrl: payment.checkoutUrl,
      successUrl: payment.successUrl,
      failureUrl: payment.failureUrl,
      cancelUrl: payment.cancelUrl,
      metadata: payment.metadata,
      errorMessage: payment.errorMessage,
      authorizedAt: payment.authorizedAt,
      capturedAt: payment.capturedAt,
      refundedAt: payment.refundedAt,
      createdAt: payment.createdAt,
      updatedAt: payment.updatedAt,
    };
  }
}


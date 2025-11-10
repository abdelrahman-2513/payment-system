import { Injectable, BadRequestException, InternalServerErrorException, Logger } from '@nestjs/common';
import { ConfigService } from '../../config/config.service';
import { IPaymentStrategy } from '../interfaces/payment-strategy.interface';
import { Payment } from '../entities/payment.entity';
import { Order } from '../../order/entities/order.entity';
import axios, { AxiosInstance } from 'axios';
import jwt from 'jsonwebtoken';

@Injectable()
export class TamaraPaymentStrategy implements IPaymentStrategy {
  private readonly logger = new Logger(TamaraPaymentStrategy.name);
  private readonly axiosInstance: AxiosInstance;
  private readonly apiUrl: string;
  private readonly apiToken: string;
  private readonly notificationToken: string;

  constructor(private readonly configService: ConfigService) {
    this.apiUrl = this.configService.tamara.apiUrl;
    this.apiToken = this.configService.tamara.apiToken;
    this.notificationToken = this.configService.tamara.notificationToken;

    this.axiosInstance = axios.create({
      baseURL: this.apiUrl,
      headers: {
        'Authorization': `Bearer ${this.apiToken}`,
        'Content-Type': 'application/json',
      },
    });
  }

  async createCheckout(payment: Payment, order: Order): Promise<{ checkoutUrl: string; externalPaymentId: string }> {
    try {
      const payload = this.buildCheckoutPayload(payment, order);
      
      this.logger.log(`Creating Tamara checkout for payment ${payment.id}`);
      
      const response = await this.axiosInstance.post('/checkout', payload);
      
      if (response.data && response.data.checkout_url && response.data.order_id) {
        return {
          checkoutUrl: response.data.checkout_url,
          externalPaymentId: response.data.order_id,
        };
      }
      
      throw new BadRequestException('Invalid response from Tamara API');
    } catch (error) {
      this.logger.error(`Failed to create Tamara checkout: ${error.message}`);
      throw new InternalServerErrorException('Failed to create payment checkout');
    }
  }

  async authorize(payment: Payment): Promise<void> {
    try {
      this.logger.log(`Authorizing Tamara payment ${payment.externalPaymentId}`);
      
      await this.axiosInstance.post(`/orders/${payment.externalPaymentId}/authorise`, {});
      
      this.logger.log(`Payment ${payment.externalPaymentId} authorized successfully`);
    } catch (error) {
      this.logger.error(`Failed to authorize payment: ${error.message}`);
      throw new InternalServerErrorException('Failed to authorize payment');
    }
  }

  async capture(payment: Payment, amount?: number): Promise<void> {
    try {
      const captureAmount = amount || payment.amount;
      
      this.logger.log(`Capturing Tamara payment ${payment.externalPaymentId} for amount ${captureAmount}`);
      
      const payload = {
        order_id: payment.externalPaymentId,
        total_amount: {
          amount: captureAmount,
          currency: payment.currency,
        },
        shipping_info: {
          shipped_at: new Date().toISOString(),
          shipping_company: 'N/A',
        },
      };

      await this.axiosInstance.post(`/payments/capture`, payload);
      
      this.logger.log(`Payment ${payment.externalPaymentId} captured successfully`);
    } catch (error) {
      this.logger.error(`Failed to capture payment: ${error.message}`);
      throw new InternalServerErrorException('Failed to capture payment');
    }
  }

  async cancel(payment: Payment): Promise<void> {
    try {
      this.logger.log(`Canceling Tamara payment ${payment.externalPaymentId}`);
      
      await this.axiosInstance.post(`/orders/${payment.externalPaymentId}/cancel`, {});
      
      this.logger.log(`Payment ${payment.externalPaymentId} canceled successfully`);
    } catch (error) {
      this.logger.error(`Failed to cancel payment: ${error.message}`);
      throw new InternalServerErrorException('Failed to cancel payment');
    }
  }

  async refund(payment: Payment, amount?: number, reason?: string): Promise<void> {
    try {
      const refundAmount = amount || payment.amount;
      
      this.logger.log(`Refunding Tamara payment ${payment.externalPaymentId} for amount ${refundAmount}`);
      
      const payload = {
        order_id: payment.externalPaymentId,
        total_amount: {
          amount: refundAmount,
          currency: payment.currency,
        },
        comment: reason || 'Customer requested refund',
      };

      await this.axiosInstance.post(`/payments/simplified-refund`, payload);
      
      this.logger.log(`Payment ${payment.externalPaymentId} refunded successfully`);
    } catch (error) {
      this.logger.error(`Failed to refund payment: ${error.message}`);
      throw new InternalServerErrorException('Failed to refund payment');
    }
  }

  async getStatus(externalPaymentId: string): Promise<string> {
    try {
      const response = await this.axiosInstance.get(`/orders/${externalPaymentId}`);
      return response.data.status;
    } catch (error) {
      this.logger.error(`Failed to get payment status: ${error.message}`);
      throw new InternalServerErrorException('Failed to get payment status');
    }
  }

  async verifyWebhook(token: string): Promise<boolean> {
    try {
      const decoded = jwt.verify(token, this.notificationToken, {
        algorithms: ['HS256'],
      });
      
      return !!decoded;
    } catch (error) {
      this.logger.error(`Failed to verify webhook token: ${error.message}`);
      return false;
    }
  }

  private buildCheckoutPayload(payment: Payment, order: Order): any {
    return {
      order_reference_id: order.orderNumber,
      total_amount: {
        amount: payment.amount,
        currency: payment.currency,
      },
      description: `Order ${order.orderNumber}`,
      country_code: 'SA',
      payment_type: 'PAY_BY_INSTALMENTS',
      locale: 'en_US',
      items: order.items.map(item => ({
        reference_id: item.id,
        type: 'physical',
        name: item.name,
        sku: item.sku,
        quantity: item.quantity,
        unit_price: {
          amount: item.unitPrice,
          currency: payment.currency,
        },
        tax_amount: {
          amount: item.taxAmount,
          currency: payment.currency,
        },
        discount_amount: {
          amount: item.discountAmount,
          currency: payment.currency,
        },
        total_amount: {
          amount: item.total,
          currency: payment.currency,
        },
      })),
      consumer: {
        email: payment.metadata?.customerEmail || 'customer@example.com',
        first_name: payment.metadata?.customerFirstName || 'Customer',
        last_name: payment.metadata?.customerLastName || 'Name',
        phone_number: payment.metadata?.customerPhone || '+966500000000',
      },
      shipping_amount: {
        amount: order.shipping,
        currency: payment.currency,
      },
      tax_amount: {
        amount: order.tax,
        currency: payment.currency,
      },
      discount: order.discountCode ? {
        name: order.discountCode,
        amount: {
          amount: order.discount,
          currency: payment.currency,
        },
      } : undefined,
      merchant_url: {
        success: payment.successUrl,
        failure: payment.failureUrl,
        cancel: payment.cancelUrl,
        notification: `${this.configService.app.port ? `http://localhost:${this.configService.app.port}` : 'https://your-domain.com'}/api/payments/webhook/tamara`,
      },
    };
  }
}


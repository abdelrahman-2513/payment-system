import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Payment } from '../entities/payment.entity';

@Injectable()
export class PaymentRepository {
  constructor(
    @InjectRepository(Payment)
    private readonly paymentRepo: Repository<Payment>,
  ) {}

  async create(paymentData: Partial<Payment>): Promise<Payment> {
    const payment = this.paymentRepo.create(paymentData);
    return await this.paymentRepo.save(payment);
  }

  async findAll(): Promise<Payment[]> {
    return await this.paymentRepo.find({
      relations: ['order', 'user'],
      order: { createdAt: 'DESC' },
    });
  }

  async findByUserId(userId: string): Promise<Payment[]> {
    return await this.paymentRepo.find({
      where: { userId },
      relations: ['order'],
      order: { createdAt: 'DESC' },
    });
  }

  async findByOrderId(orderId: string): Promise<Payment[]> {
    return await this.paymentRepo.find({
      where: { orderId },
      relations: ['order'],
      order: { createdAt: 'DESC' },
    });
  }

  async findById(id: string): Promise<Payment | null> {
    return await this.paymentRepo.findOne({
      where: { id },
      relations: ['order', 'user'],
    });
  }

  async findByPaymentReference(paymentReference: string): Promise<Payment | null> {
    return await this.paymentRepo.findOne({
      where: { paymentReference },
      relations: ['order', 'user'],
    });
  }

  async findByExternalPaymentId(externalPaymentId: string): Promise<Payment | null> {
    return await this.paymentRepo.findOne({
      where: { externalPaymentId },
      relations: ['order', 'user'],
    });
  }

  async update(id: string, updateData: Partial<Payment>): Promise<Payment | null> {
    await this.paymentRepo.update(id, updateData);
    return this.findById(id);
  }

  async delete(id: string): Promise<boolean> {
    const result = await this.paymentRepo.delete(id);
    return result.affected > 0;
  }

  async count(): Promise<number> {
    return await this.paymentRepo.count();
  }
}


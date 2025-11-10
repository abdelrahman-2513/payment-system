import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Order } from '../entities/order.entity';
import { CreateOrderDto, UpdateOrderDto } from '../dtos';

@Injectable()
export class OrderRepository {
  constructor(
    @InjectRepository(Order)
    private readonly orderRepo: Repository<Order>,
  ) {}

  async create(orderData: Partial<Order>): Promise<Order> {
    const order = this.orderRepo.create(orderData);
    return await this.orderRepo.save(order);
  }

  async findAll(): Promise<Order[]> {
    return await this.orderRepo.find({
      relations: ['items', 'user'],
      order: { createdAt: 'DESC' },
    });
  }

  async findByUserId(userId: string): Promise<Order[]> {
    return await this.orderRepo.find({
      where: { userId },
      relations: ['items'],
      order: { createdAt: 'DESC' },
    });
  }

  async findById(id: string): Promise<Order | null> {
    return await this.orderRepo.findOne({
      where: { id },
      relations: ['items', 'user'],
    });
  }

  async findByOrderNumber(orderNumber: string): Promise<Order | null> {
    return await this.orderRepo.findOne({
      where: { orderNumber },
      relations: ['items', 'user'],
    });
  }

  async update(id: string, updateData: Partial<Order>): Promise<Order | null> {
    await this.orderRepo.update(id, updateData);
    return this.findById(id);
  }

  async delete(id: string): Promise<boolean> {
    const result = await this.orderRepo.delete(id);
    return result.affected > 0;
  }

  async count(): Promise<number> {
    return await this.orderRepo.count();
  }
}


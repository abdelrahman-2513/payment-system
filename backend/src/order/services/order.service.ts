import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { OrderRepository } from '../repositories/order.repository';
import { CreateOrderDto, UpdateOrderDto, OrderResponseDto } from '../dtos';
import { Order } from '../entities/order.entity';
import { OrderItem } from '../entities/order-item.entity';
import { OrderStatus } from '../../shared/enums';

@Injectable()
export class OrderService {
  constructor(private readonly orderRepository: OrderRepository) {}

  private async generateOrderNumber(): Promise<string> {
    const timestamp = Date.now();
    const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
    return `ORD-${timestamp}-${random}`;
  }

  private calculateTotals(items: Partial<OrderItem>[], discount: number = 0, tax: number = 0, shipping: number = 0) {
    const subtotal = items.reduce((sum, item) => {
      const itemTotal = item.quantity * item.unitPrice - (item.discountAmount || 0);
      return sum + itemTotal;
    }, 0);

    const total = subtotal - discount + tax + shipping;

    return { subtotal, total };
  }

  async create(userId: string, createOrderDto: CreateOrderDto): Promise<OrderResponseDto> {
    const { items, discount = 0, tax = 0, shipping = 0, currency = 'SAR', ...orderData } = createOrderDto;

    if (!items || items.length === 0) {
      throw new BadRequestException('Order must contain at least one item');
    }

    const orderItems = items.map(item => ({
      ...item,
      total: item.quantity * item.unitPrice - (item.discountAmount || 0),
      taxAmount: item.taxAmount || 0,
      discountAmount: item.discountAmount || 0,
    }));

    const { subtotal, total } = this.calculateTotals(orderItems, discount, tax, shipping);
    const orderNumber = await this.generateOrderNumber();

    const order = await this.orderRepository.create({
      orderNumber,
      userId,
      status: OrderStatus.PENDING,
      subtotal,
      discount,
      tax,
      shipping,
      total,
      currency,
      items: orderItems as OrderItem[],
      ...orderData,
    });

    return this.mapToResponseDto(order);
  }

  async findAll(): Promise<OrderResponseDto[]> {
    const orders = await this.orderRepository.findAll();
    return orders.map(order => this.mapToResponseDto(order));
  }

  async findByUserId(userId: string): Promise<OrderResponseDto[]> {
    const orders = await this.orderRepository.findByUserId(userId);
    return orders.map(order => this.mapToResponseDto(order));
  }

  async findById(id: string): Promise<OrderResponseDto> {
    const order = await this.orderRepository.findById(id);
    if (!order) {
      throw new NotFoundException(`Order with ID ${id} not found`);
    }
    return this.mapToResponseDto(order);
  }

  async findByOrderNumber(orderNumber: string): Promise<OrderResponseDto> {
    const order = await this.orderRepository.findByOrderNumber(orderNumber);
    if (!order) {
      throw new NotFoundException(`Order with number ${orderNumber} not found`);
    }
    return this.mapToResponseDto(order);
  }

  async update(id: string, updateOrderDto: UpdateOrderDto): Promise<OrderResponseDto> {
    const existingOrder = await this.orderRepository.findById(id);
    if (!existingOrder) {
      throw new NotFoundException(`Order with ID ${id} not found`);
    }

    const updatedOrder = await this.orderRepository.update(id, updateOrderDto as Partial<Order>);
    return this.mapToResponseDto(updatedOrder);
  }

  async updateStatus(id: string, status: OrderStatus): Promise<OrderResponseDto> {
    const order = await this.orderRepository.findById(id);
    if (!order) {
      throw new NotFoundException(`Order with ID ${id} not found`);
    }

    const updatedOrder = await this.orderRepository.update(id, { status });
    return this.mapToResponseDto(updatedOrder);
  }

  async delete(id: string): Promise<void> {
    const order = await this.orderRepository.findById(id);
    if (!order) {
      throw new NotFoundException(`Order with ID ${id} not found`);
    }

    await this.orderRepository.delete(id);
  }

  private mapToResponseDto(order: Order): OrderResponseDto {
    return {
      id: order.id,
      orderNumber: order.orderNumber,
      userId: order.userId,
      status: order.status,
      items: order.items?.map(item => ({
        id: item.id,
        name: item.name,
        description: item.description,
        sku: item.sku,
        quantity: item.quantity,
        unitPrice: Number(item.unitPrice),
        total: Number(item.total),
        taxAmount: Number(item.taxAmount),
        discountAmount: Number(item.discountAmount),
      })) || [],
      subtotal: Number(order.subtotal),
      discount: Number(order.discount),
      tax: Number(order.tax),
      shipping: Number(order.shipping),
      total: Number(order.total),
      currency: order.currency,
      discountCode: order.discountCode,
      notes: order.notes,
      shippingAddress: order.shippingAddress,
      billingAddress: order.billingAddress,
      createdAt: order.createdAt,
      updatedAt: order.updatedAt,
    };
  }
}


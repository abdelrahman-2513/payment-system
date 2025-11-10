import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  UseGuards,
  HttpStatus,
  HttpCode,
  Patch,
} from '@nestjs/common';
import { OrderService } from '../services/order.service';
import { CreateOrderDto, UpdateOrderDto, OrderResponseDto } from '../dtos';
import { CurrentUser } from '../../shared/decorators';
import { OrderStatus } from '../../shared/enums';
import { ATPayload } from 'src/shared/types';

@Controller('orders')
export class OrderController {
  constructor(private readonly orderService: OrderService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  async create(
    @CurrentUser() user: ATPayload,
    @Body() createOrderDto: CreateOrderDto,
  ): Promise<OrderResponseDto> {
    return await this.orderService.create(user.id, createOrderDto);
  }

  @Get()
  async findAll(): Promise<OrderResponseDto[]> {
    return await this.orderService.findAll();
  }

  @Get('my-orders')
  async getMyOrders(@CurrentUser() user: ATPayload): Promise<OrderResponseDto[]> {
    return await this.orderService.findByUserId(user.id);
  }

  @Get(':id')
  async findById(@Param('id') id: string): Promise<OrderResponseDto> {
    return await this.orderService.findById(id);
  }

  @Get('number/:orderNumber')
  async findByOrderNumber(@Param('orderNumber') orderNumber: string): Promise<OrderResponseDto> {
    return await this.orderService.findByOrderNumber(orderNumber);
  }

  @Put(':id')
  async update(
    @Param('id') id: string,
    @Body() updateOrderDto: UpdateOrderDto,
  ): Promise<OrderResponseDto> {
    return await this.orderService.update(id, updateOrderDto);
  }

  @Patch(':id/status')
  async updateStatus(
    @Param('id') id: string,
    @Body('status') status: OrderStatus,
  ): Promise<OrderResponseDto> {
    return await this.orderService.updateStatus(id, status);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async delete(@Param('id') id: string): Promise<void> {
    await this.orderService.delete(id);
  }
}


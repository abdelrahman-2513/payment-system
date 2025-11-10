import { OrderStatus } from '../../shared/enums';

export interface IOrder {
  id: string;
  orderNumber: string;
  userId: string;
  status: OrderStatus;
  subtotal: number;
  discount: number;
  tax: number;
  shipping: number;
  total: number;
  currency: string;
  discountCode?: string;
  notes?: string;
  shippingAddress?: string;
  billingAddress?: string;
  createdAt: Date;
  updatedAt: Date;
}


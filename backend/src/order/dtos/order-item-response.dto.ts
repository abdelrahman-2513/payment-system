export class OrderItemResponseDto {
  id: string;
  name: string;
  description?: string;
  sku: string;
  quantity: number;
  unitPrice: number;
  total: number;
  taxAmount: number;
  discountAmount: number;
}


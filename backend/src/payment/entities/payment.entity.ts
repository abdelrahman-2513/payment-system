import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Order } from '../../order/entities/order.entity';
import { User } from '../../user/entities/user.entity';
import { PaymentStatus } from '../../shared/enums';

@Entity('payments')
export class Payment {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'payment_reference', unique: true })
  paymentReference: string;

  @Column({ name: 'order_id' })
  orderId: string;

  @ManyToOne(() => Order)
  @JoinColumn({ name: 'order_id' })
  order: Order;

  @Column({ name: 'user_id' })
  userId: string;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'user_id' })
  user: User;

  @Column({ name: 'payment_method' })
  paymentMethod: string; // 'tamara', 'stripe', 'paypal', etc.

  @Column({
    type: 'enum',
    enum: PaymentStatus,
    default: PaymentStatus.PENDING,
  })
  status: PaymentStatus;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  amount: number;

  @Column({ length: 3, default: 'SAR' })
  currency: string;

  @Column({ name: 'external_payment_id', nullable: true })
  externalPaymentId: string; // Payment ID from the payment gateway

  @Column({ name: 'checkout_url', type: 'text', nullable: true })
  checkoutUrl: string;

  @Column({ name: 'success_url', type: 'text', nullable: true })
  successUrl: string;

  @Column({ name: 'failure_url', type: 'text', nullable: true })
  failureUrl: string;

  @Column({ name: 'cancel_url', type: 'text', nullable: true })
  cancelUrl: string;

  @Column({ type: 'json', nullable: true })
  metadata: any;

  @Column({ name: 'error_message', type: 'text', nullable: true })
  errorMessage: string;

  @Column({ name: 'authorized_at', type: 'timestamp', nullable: true })
  authorizedAt: Date;

  @Column({ name: 'captured_at', type: 'timestamp', nullable: true })
  capturedAt: Date;

  @Column({ name: 'refunded_at', type: 'timestamp', nullable: true })
  refundedAt: Date;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}


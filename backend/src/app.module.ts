import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UserModule } from './user/user.module';
import { AuthModule } from './auth/auth.module';
import { ConfigService } from './config/config.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule } from './config/config.module';
import { APP_FILTER, APP_GUARD, APP_INTERCEPTOR } from '@nestjs/core';
import { AllExceptionsFilter } from './shared/filters/all-exception.filter';
import { TransformInterceptor } from './shared/transformers/transformer.interceptor';
import { ThrottlerGuard, ThrottlerModule } from '@nestjs/throttler';
import { AuthGuard } from './auth/guards/auth.guard';
import { User } from './user/entities/user.entity';
import { Order } from './order/entities/order.entity';
import { OrderItem } from './order/entities/order-item.entity';
import { Payment } from './payment/entities/payment.entity';
import { OrderModule } from './order/order.module';
import { PaymentModule } from './payment/payment.module';


@Module({
  imports: [
    ThrottlerModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        throttlers: [
          {
            name: 'short',
            ttl: configService.throttling.shortTtl,
            limit: configService.throttling.shortLimit,
          },
          {
            name: 'medium',
            ttl: configService.throttling.mediumTtl,
            limit: configService.throttling.mediumLimit,
          },
          {
            name: 'long',
            ttl: configService.throttling.longTtl,
            limit: configService.throttling.longLimit,
          },
        ],
        ignoreUserAgents: [
          /health-check/i,
        ],
      }),
    }),
    ConfigModule,
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        type: 'postgres',
        host: configService.database.host,
        port: configService.database.port,
        username: configService.database.username,
        password: configService.database.password,
        database: configService.database.database,
        entities: [User, Order, OrderItem, Payment],
        synchronize: true, 
        logging: false,
      }),
    }),
    AuthModule, 
    UserModule,
    OrderModule,
    PaymentModule
  ],
  controllers: [AppController],
  providers: [AppService, ConfigService,
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard
    },
    {
    provide: APP_INTERCEPTOR,
    useClass: TransformInterceptor,
  },{
    provide: APP_FILTER,
    useClass: AllExceptionsFilter,
  }],
})
export class AppModule {}

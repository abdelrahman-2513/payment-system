# E-Commerce Payment System Backend API

## Overview

This is a comprehensive backend API built with **NestJS** for e-commerce operations with integrated payment processing. The application provides authentication, user management, order management, and payment processing with **Tamara Payment Gateway**. It features a **modular architecture** following **SOLID principles**, with **custom interceptors**, **rate-limiting**, **helmet** for security, and **exception filters** for error handling.

## Architecture

- **Backend**: NestJS (TypeScript), TypeORM, PostgreSQL, JWT Authentication
- **Database**: PostgreSQL with persistent volume storage
- **Payment Gateway**: Tamara (with extensible architecture for additional gateways)
- **Security**: Helmet, Rate Limiting, JWT Guards, Exception Filters
- **Containerization**: Docker with Docker Compose for easy deployment

## Features

- **Authentication & Authorization**:
  - User registration and login with JWT tokens
  - Protected routes with authentication guards
  - Role-based access control

- **User Management**:
  - Complete CRUD operations for user accounts
  - User profile management
  - Secure password handling with bcrypt

- **Order Management**:
  - Create and manage orders with multiple items
  - Order status tracking (pending, processing, completed, etc.)
  - Order history and retrieval
  - Discount and tax calculations

- **Payment Processing** (SOLID Principles):
  - Extensible payment gateway integration using Strategy Pattern
  - Support for Tamara payment gateway (installments)
  - Easy addition of new payment methods (Stripe, PayPal, etc.)
  - Payment lifecycle: Create → Authorize → Capture → Refund
  - Webhook handling for payment notifications
  - Full and partial refund support

- **Security Features**:
  - Rate limiting to prevent abuse
  - Helmet middleware for HTTP security headers
  - Global exception handling
  - Input validation with class-validator
  - Webhook signature verification

## Backend Setup (NestJS)

### Installation

1. Clone the repository:

   ```bash
   git clone https://github.com/abdelrahman-2513/payment-system
   cd backend
   ```

2. Install dependencies:

    ```bash
    npm install
   ```

3. Environment Configuration:
   
   Create a `.env` file in the backend directory (or copy from `env.example`):
   
   ```bash
   # Database Configuration (PostgreSQL)
   DB_SERVER=localhost
   DB_PORT=5432
   DB_NAME=postgres
   DB_USER=postgres_user
   DB_PASSWORD=postgres_password
   
   # JWT Configuration
   JWT_KEY=YourSuperSecretJWTKeyThatIsAtLeast32CharactersLong!
   JWT_ISSUER=postgres
   JWT_AUDIENCE=postgresUsers
   JWT_EXPIRE_MINUTES=60
   
   # Application Configuration
   PORT=3000
   NODE_ENV=development
   WHITELIST=http://localhost:4200
   
   # Tamara Payment Gateway Configuration
   TAMARA_API_URL=https://api-sandbox.tamara.co
   TAMARA_API_TOKEN=your_tamara_api_token_here
   TAMARA_NOTIFICATION_TOKEN=your_tamara_notification_token_here
   TAMARA_PUBLIC_KEY=your_tamara_public_key_here
   ```

4. Start Development Server:

    ```bash
    npm run start:dev
   ```

### Docker Setup (Recommended)

Using Docker Compose (includes PostgreSQL):

   ```bash
   # Start the application with PostgreSQL
   docker-compose up -d
   
   # View logs
   docker-compose logs -f
   
   # Stop the application
   docker-compose down
   
   # Stop and remove volumes
   docker-compose down -v
   ```

## Backend Structure

The backend follows a modular architecture with clear separation of concerns following **SOLID principles**. Here's the overview of the key directories and modules:

### **`src/`** 
Contains the main backend application code.

### **`auth/`**
Authentication and authorization module:
- **Controllers**: Handle login and registration endpoints
- **Services**: JWT token generation and validation
- **Guards**: Authentication guards for protected routes
- **Decorators**: Custom decorators for public routes and roles
- **DTOs**: Data transfer objects for auth requests/responses

### **`user/`**
User management module for CRUD operations:
- **Controllers**: Handle user-related HTTP requests
- **Services**: Business logic for user operations
- **Repositories**: Data access layer for user entities
- **Entities**: User entity with relations
- **DTOs**: Request/response data transfer objects

### **`order/`**
Order management module:
- **Controllers**: Handle order CRUD operations
- **Services**: Order creation and status management
- **Repositories**: Data access layer for order entities
- **Entities**: Order and OrderItem entities
- **DTOs**: Order request/response DTOs with validation
- **Response DTOs**: Standardized order response format

### **`payment/`**
Payment processing module (SOLID principles):
- **Controllers**: Handle payment operations and webhooks
- **Services**: Payment orchestration and lifecycle management
- **Repositories**: Data access layer for payment entities
- **Strategies**: Payment gateway implementations (Tamara, extensible for more)
- **Factory**: PaymentStrategyFactory for selecting payment method
- **Interfaces**: IPaymentStrategy for consistent gateway integration
- **DTOs**: Payment request/response DTOs with validation
- **Response DTOs**: Standardized payment response format

### **`shared/`**
Common utilities and shared components:
- **Exception Filters**: Global error handling
- **Interceptors**: Response transformation and logging
- **Decorators**: Shared decorators (CurrentUser, etc.)
- **DTOs**: Shared data transfer objects (PaginatedResponse, ResponseDto)
- **Enums**: Application-wide enumerations (OrderStatus, PaymentStatus, etc.)

### **`config/`**
Configuration management:
- **Config Service**: Environment variable management
- **Database Configuration**: PostgreSQL TypeORM setup
- **JWT Configuration**: Token settings and validation
- **Tamara Configuration**: Payment gateway credentials

### **`main.ts`**
Application entry point that initializes the NestJS application with middleware and global configurations.

### **`app.module.ts`**
Root module that imports and configures all feature modules, middleware, and global providers.


## API Endpoints

### Authentication Endpoints

- **POST /auth/signup**: User registration with email and password
- **POST /auth/signin**: User login with JWT token response

### User Management (Protected Routes)

- **GET /user**: Fetch current user profile
- **PATCH /user**: Update user information
- **DELETE /user**: Delete user account

### Order Management (Protected Routes)

- **POST /orders**: Create a new order
- **GET /orders**: Get all orders (admin)
- **GET /orders/my-orders**: Get current user's orders
- **GET /orders/:id**: Get order by ID
- **GET /orders/number/:orderNumber**: Get order by order number
- **PUT /orders/:id**: Update order
- **PATCH /orders/:id/status**: Update order status
- **DELETE /orders/:id**: Delete order

### Payment Management (Protected Routes)

- **POST /payments**: Create a new payment and checkout session
- **GET /payments**: Get all payments (admin)
- **GET /payments/my-payments**: Get current user's payments
- **GET /payments/methods**: Get supported payment methods (public)
- **GET /payments/:id**: Get payment by ID
- **GET /payments/reference/:reference**: Get payment by reference
- **GET /payments/order/:orderId**: Get payments by order ID
- **PATCH /payments/:id/authorize**: Authorize a payment
- **PATCH /payments/:id/capture**: Capture a payment
- **PATCH /payments/:id/cancel**: Cancel a payment
- **PATCH /payments/:id/refund**: Refund a payment (full or partial)
- **POST /payments/webhook/tamara**: Tamara webhook endpoint (public)
- **POST /payments/webhook/:paymentMethod**: Generic webhook endpoint (public)

## Security Features

### 1. Authentication & Authorization

- JWT-based authentication with configurable expiration
- Protected routes with authentication guards
- Role-based access control (extensible)

### 2. Rate Limiting

- Multi-tier rate limiting using `@nestjs/throttler`:
  - Short-term: 10 requests per minute
  - Medium-term: 20 requests per 5 minutes
  - Long-term: 100 requests per 15 minutes

### 3. Security Headers

- Helmet middleware for HTTP security headers

### 4. Input Validation

- Class-validator for request validation
- Custom validation pipes for data integrity

### 5. Exception Handling

- Global exception filters for consistent error responses
- Structured error messages with proper HTTP status codes

## Development

### Prerequisites

- Node.js (v18 or higher)
- PostgreSQL (v15 or higher)
- Docker and Docker Compose (optional but recommended)

### Available Scripts

```bash
# Development
npm run start:dev          # Start in development mode with hot reload
npm run start:debug        # Start in debug mode

# Production
npm run build              # Build the application
npm run start:prod         # Start in production mode

```

### Database Schema

The application uses the following main entities:

- **User**: User accounts with authentication
- **Order**: Order records with items, status, and pricing
- **OrderItem**: Individual items within an order
- **Payment**: Payment transactions with gateway integration

### Environment Variables

All configuration is managed through environment variables. See the installation section for the complete list of required variables.

## Docker Configuration

The application includes Docker support for easy deployment:

- **Dockerfile**: Multi-stage build for optimized production image
- **docker-compose.yml**: Complete stack with PostgreSQL database
- **Persistent volumes**: Data persistence for PostgreSQL

## SOLID Principles Implementation

This project follows SOLID principles, especially in the payment system:

### 1. Single Responsibility Principle (SRP)
Each class has one clear purpose:
- **PaymentService**: Orchestrates payment operations
- **PaymentRepository**: Handles database operations
- **PaymentStrategy**: Implements payment gateway-specific logic
- **PaymentController**: Handles HTTP requests/responses

### 2. Open/Closed Principle (OCP)
The system is **open for extension** but **closed for modification**:
- New payment methods can be added without changing existing code
- Just create a new strategy class implementing `IPaymentStrategy`

### 3. Liskov Substitution Principle (LSP)
All payment strategies implement the same interface and can be used interchangeably

### 4. Interface Segregation Principle (ISP)
Payment strategies only implement the methods they need through focused interfaces

### 5. Dependency Inversion Principle (DIP)
High-level modules depend on abstractions (interfaces) not concrete implementations

## Adding New Payment Methods

Adding a new payment method is straightforward:

1. **Create a new strategy** in `src/payment/strategies/`
2. **Implement IPaymentStrategy** interface
3. **Register in PaymentStrategyFactory**
4. **Add to PaymentModule providers**
5. **Add configuration** in ConfigService

See `PAYMENT_SYSTEM.md` for detailed instructions.

## Tamara Payment Gateway

The system integrates with Tamara for "Pay by Installments" functionality:

### Sandbox Credentials
- **API URL**: `https://api-sandbox.tamara.co`
- **Partner Portal**: `https://partners-sandbox.tamara.co`

### Payment Flow
1. Create order → 2. Create payment → 3. Customer pays on Tamara → 4. Webhook notification → 5. Authorize → 6. Capture → 7. Refund (if needed)


## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests for new functionality
5. Ensure all tests pass
6. Submit a pull request


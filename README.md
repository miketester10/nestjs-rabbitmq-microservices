# 🚀 NestJS Microservices with RabbitMQ

A robust, production-ready microservices architecture built with NestJS, featuring secure authentication, 2FA, and asynchronous communication via RabbitMQ.

## 🎯 Overview

This project demonstrates a modern microservices architecture with:

- **API Gateway**: Centralized authentication and user management
- **Email Service**: Asynchronous email processing via RabbitMQ
- **Secure Authentication**: JWT with refresh tokens and 2FA support
- **Database**: PostgreSQL with TypeORM
- **Caching**: Redis for session management and rate limiting
- **Message Queue**: RabbitMQ for inter-service communication

## 🏗️ Architecture

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   API Gateway   │    │  Email Service  │    │   PostgreSQL    │
│                 │    │                 │    │                 │
│ • Authentication│◄──►│ • Email Sending │    │ • User Data     │
│ • User Mgmt     │    │ • Templates     │    │ • Sessions      │
│ • JWT & 2FA     │    │ • Queue Handler │    │                 │
└─────────────────┘    └─────────────────┘    └─────────────────┘
         │                       │                       │
         │                       │                       │
         ▼                       ▼                       ▼
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│     RabbitMQ    │    │      Redis      │    │   Swagger UI    │
│                 │    │                 │    │                 │
│ • Message Queue │    │ • Cache         │    │ • API Docs      │
│ • Event Bus     │    │ • Rate Limiting │    │ • Testing       │
│ • Durability    │    │ • Sessions      │    │                 │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

## ✨ Features

### 🔐 Authentication & Security

- **JWT Authentication** with access and refresh tokens
- **Two-Factor Authentication (2FA)** with TOTP (Google Authenticator, Authy, etc)
- **Password encryption** with bcrypt
- **Token rotation** for enhanced security
- **Rate limiting** to prevent abuse
- **Input validation** with class-validator
- **CORS protection**

### 👤 User Management

- User registration with email verification
- Profile management
- Password reset functionality
- Account verification system

### 📧 Email System

- Asynchronous email processing
- HTML email templates
- Email verification
- Password reset emails
- Queue-based processing

### 🛡️ Security Features

- **Encrypted secrets** (AES encryption for 2FA secrets)
- **Token invalidation** on logout
- **Session management** with Redis
- **Request throttling**
- **SQL injection protection** with TypeORM
- **XSS protection** with input sanitization

## 🛠️ Tech Stack

### Backend

- **NestJS** - Progressive Node.js framework
- **TypeScript** - Type-safe JavaScript
- **TypeORM** - Object-Relational Mapping
- **PostgreSQL** - Primary database
- **Redis** - Caching and session storage
- **RabbitMQ** - Message broker

### Security & Auth

- **JWT** - JSON Web Tokens
- **Passport** - Authentication middleware
- **bcrypt** - Password hashing
- **Speakeasy** - 2FA implementation
- **Crypto-JS** - Encryption utilities

### Development Tools

- **ESLint** - Code linting
- **Prettier** - Code formatting
- **Swagger** - API documentation
- **Docker** - Containerization

## 📋 Prerequisites

- **Node.js** (v18 or higher)
- **npm** or **yarn**
- **Docker** and **Docker Compose**
- **PostgreSQL** (v13+)
- **Redis** (v6+)
- **RabbitMQ** (v3.8+)

## 🚀 Installation

1. **Clone the repository**

```bash
git clone https://github.com/miketester10/nestjs-rabbitmq-microservices.git
cd nestjs-rabbitmq-microservices
```

2. **Start infrastructure services**

```bash
docker compose up -d
```

3. **Install dependencies**

```bash
# API Gateway
cd api-gateway
npm install

# Email Service
cd ../email-service
npm install
```

4. **Environment Configuration**

```bash
# Copy environment files
cp api-gateway/.env.example api-gateway/.env
cp email-service/.env.example email-service/.env
```

## ⚙️ Configuration

### Environment Variables

#### API Gateway (.env)

```env
# Database
DB_HOST=localhost
DB_PORT=5432
DB_USERNAME=your_username
DB_PASSWORD=your_password
DB_NAME=your_database

# Redis
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=your_redis_password
REDIS_URL=redis://localhost:6379

# JWT
JWT_SECRET=your_jwt_secret
JWT_REFRESH_SECRET=your_refresh_secret
JWT_EXPIRES_IN=15m
JWT_REFRESH_EXPIRES_IN=7d

# Encryption
ENCRYPTION_KEY=your_encryption_key

# RabbitMQ
RABBITMQ_URL=amqp://localhost:5672
RABBITMQ_QUEUE=email_queue

# Email URLs
BASE_URL_VERIFY_EMAIL=http://frontend-url.it/users/verify-email
BASE_URL_RESET_PASSWORD=http://frontend-url.it/auth/reset-password

# Server
PORT=3000
NODE_ENV=development
```

#### Email Service (.env)

```env
# RabbitMQ
RABBITMQ_URL=amqp://localhost:5672
RABBITMQ_QUEUE=email_queue

# Email Configuration
HOST=smtp.gmail.com
PORT=587
USER_EMAIL=your_email@gmail.com
PASSWORD_APP=your_app_password

# Server
NODE_ENV=development
```

## 📚 API Documentation

Once the application is running, access the interactive API documentation at:

- **Swagger UI**: http://localhost:3000/docs

### Main Endpoints

#### Authentication (`/auth`)

- `POST /auth/login` - User login
- `GET /auth/refresh-token` - Refresh access token
- `DELETE /auth/logout` - User logout
- `POST /auth/forgot-password` - Request password reset
- `POST /auth/reset-password` - Reset password

#### Two-Factor Authentication (`/auth/2fa`)

- `GET /auth/2fa/setup` - Setup 2FA
- `POST /auth/2fa/setup/verify` - Verify 2FA setup
- `POST /auth/2fa/verify` - Verify 2FA code
- `POST /auth/2fa/disable` - Disable 2FA

#### User Management (`/users`)

- `POST /users/register` - User registration
- `GET /users/verify-email` - Verify email address
- `POST /users/resend-email-verification` - Resend verification email
- `GET /users/profile` - Get user profile

## 💡 Usage Examples

### User Registration

```bash
curl -X POST http://localhost:3000/users/register \
  -H "Content-Type: application/json" \
  -d '{
    "firstName": "John",
    "lastName": "Doe",
    "email": "john@example.com",
    "password": "password123",
    "confirmPassword": "password123"
  }'
```

### User Login

```bash
curl -X POST http://localhost:3000/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "john@example.com",
    "password": "password123"
  }'
```

### Setup 2FA

```bash
curl -X GET http://localhost:3000/auth/2fa/setup \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

### Verify 2FA

```bash
curl -X POST http://localhost:3000/auth/2fa/verify \
  -H "Authorization: Bearer YOUR_2FA_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "code": "123456"
  }'
```

## 🔒 Security Features

### JWT Implementation

- **Access Token**: Short-lived (1 hour / 2 minutes for verify 2FA code)
- **Refresh Token**: Long-lived (7 days) with rotation
- **Token Encryption**: Refresh tokens encrypted in Redis
- **Automatic Invalidation**: Tokens invalidated on logout

### Two-Factor Authentication

- **TOTP Support**: Compatible with Google Authenticator, Authy
- **QR Code Generation**: Easy setup process
- **Encrypted Storage**: 2FA secrets encrypted in database
- **Backup Codes**: Recovery mechanism

### Rate Limiting

- **Global Rate Limit**: 100 requests/minute
- **Auth Endpoints**: 4 requests/minute
- **Password Reset**: 1 request/minute
- **Redis-based**: Distributed rate limiting

## 🛠️ Development

### Start Development Servers

```bash
# Terminal 1 - API Gateway
cd api-gateway
npm run start:dev

# Terminal 2 - Email Service
cd email-service
npm run start:dev
```

## 🚀 Deployment

### Docker Deployment

```bash
# Build and start all services
docker compose up -d

# View logs
docker compose logs -f

# Stop services
docker compose down
```

### Production Considerations

- Use environment-specific configuration
- Enable SSL/TLS certificates
- Configure proper logging
- Set up monitoring and alerting
- Use secrets management
- Configure backup strategies

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### Development Guidelines

- Follow TypeScript best practices
- Update documentation
- Follow conventional commits
- Ensure code passes linting

## 🙏 Acknowledgments

- [NestJS](https://nestjs.com/) - Progressive Node.js framework
- [TypeORM](https://typeorm.io/) - Object-Relational Mapping
- [RabbitMQ](https://www.rabbitmq.com/) - Message broker
- [Redis](https://redis.io/) - In-memory data store

**Built with ❤️ using NestJS and TypeScript**

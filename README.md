# 🚀 NestJS Microservices with RabbitMQ

A robust, production-ready microservices architecture built with NestJS, featuring secure authentication, 2FA, and asynchronous communication via RabbitMQ.

## 🎯 Overview

This project demonstrates a modern microservices architecture with:

- **API Gateway**: Centralized authentication and user management
- **Email Service**: Asynchronous email processing via RabbitMQ
- **Frontend**: React application with TypeScript, TanStack Query, and Tailwind CSS
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

### API Gateway Modules

- **AuthModule**: Handles authentication, JWT tokens, 2FA setup/verification, password reset
  - JWT Module: Standard JWT authentication
  - JWT-2FA Module: Two-factor authentication tokens
  - JWT-REFRESH Module: Refresh token management
  - Encryption Service: AES encryption for sensitive data
- **UserModule**: User registration, email verification, profile management
- **EmailModule**: RabbitMQ client for sending emails asynchronously
- **Common**: Shared utilities, decorators, filters, interceptors, interfaces

### Email Service Modules

- **EmailModule**: Processes email messages from RabbitMQ queue
  - Email Controller: Receives messages via RabbitMQ
  - Email Service: Sends emails using Nodemailer

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
- Resend verification email (via modal when account is not verified)
- Account deletion with confirmation email

### 📧 Email System

- Asynchronous email processing
- HTML email templates
- Email verification
- Password reset emails
- Account deletion confirmation emails
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
- **Zod** - Schema validation for environment variables
- **Nodemailer** - Email sending (Email Service)

### Frontend

- **React** - UI library
- **TypeScript** - Type safety
- **Vite** - Build tool and dev server
- **TanStack Query** - Data fetching and caching
- **React Hook Form** - Form management
- **Zod** - Schema validation for forms
- **@hookform/resolvers** - React Hook Form integration with Zod
- **Tailwind CSS** - Utility-first CSS framework
- **React Router** - Client-side routing
- **Axios** - HTTP client
- **Zustand** - State management with persistence
- **next-themes** - Theme management (dark mode)
- **lucide-react** - Icon library

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

## 📁 Project Structure

```
nestjs-rabbitmq-microservices/
├── backend/
│   ├── api-gateway/          # API Gateway service
│   │   ├── src/
│   │   │   ├── auth/         # Authentication module
│   │   │   ├── user/         # User management module
│   │   │   ├── email/        # Email module (RabbitMQ client)
│   │   │   ├── common/       # Shared utilities
│   │   │   └── config/       # Configuration
│   │   ├── db/               # Database configuration
│   │   ├── Dockerfile        # Docker configuration for API Gateway
│   │   └── docker-compose.yml # Docker Compose for API Gateway
│   └── email-service/        # Email microservice
│       ├── src/
│       │   ├── email/        # Email processing
│       │   ├── common/       # Shared interfaces
│       │   └── config/       # Configuration
│       ├── Dockerfile        # Docker configuration for Email Service
│       └── docker-compose.yml # Docker Compose for Email Service
├── frontend/                 # React frontend application
│   ├── src/
│   │   ├── api/              # API client
│   │   ├── components/       # React components
│   │   ├── pages/            # Page components
│   │   ├── schemas/          # Zod validation schemas
│   │   ├── store/            # State management (Zustand)
│   │   ├── index.css         # Global styles
│   │   └── dark-mode-auto.css # Automatic dark mode styles
│   └── vercel.json           # Vercel deployment configuration
├── docker-compose.yml        # Docker services configuration
└── README.md
```

## 🚀 Installation

1. **Clone the repository**

```bash
git clone https://github.com/miketester10/nestjs-rabbitmq-microservices.git
cd nestjs-rabbitmq-microservices
```

2. **Create Docker network (if needed)**

```bash
docker network create my-custom-backend
```

3. **Start infrastructure services**

```bash
docker compose up -d
```

This will start:

- **PostgreSQL** on port `5432`
- **Redis** on port `6379`
- **RabbitMQ** on port `5672` (Management UI on port `15672`)

**Note**: The `docker-compose.yml` uses an external network named `my-custom-backend`. If it doesn't exist, create it with the command above.

4. **Install dependencies**

```bash
# API Gateway
cd backend/api-gateway
npm install

# Email Service
cd ../email-service
npm install

# Frontend
cd ../../frontend
npm install
```

5. **Environment Configuration**

Create `.env` files in each service directory with the required variables (see Configuration section below).

## ⚙️ Configuration

### Environment Variables

#### API Gateway (backend/api-gateway/.env)

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
JWT_EXPIRES_IN=15m
JWT_2FA_SECRET=your_jwt_2fa_secret
JWT_2FA_EXPIRES_IN=2m
JWT_REFRESH_SECRET=your_refresh_secret
JWT_REFRESH_EXPIRES_IN=7d

# Encryption
ENCRYPTION_KEY=your_encryption_key

# RabbitMQ
RABBITMQ_URL=amqp://localhost:5672
RABBITMQ_QUEUE=email_queue

# Email URLs (Frontend URLs)
BASE_URL_VERIFY_EMAIL=http://localhost:5173/verify-email
BASE_URL_RESET_PASSWORD=http://localhost:5173/reset-password

# Server
PORT=3000
NODE_ENV=development
```

#### Email Service (backend/email-service/.env)

```env
# RabbitMQ
RABBITMQ_URL=amqp://localhost:5672
RABBITMQ_QUEUE=email_queue

# Email Configuration (SMTP)
HOST=smtp.gmail.com
PORT=587
USER_EMAIL=your_email@gmail.com
PASSWORD_APP=your_app_password
```

#### Frontend (frontend/.env)

```env
# API Gateway URL
VITE_API_URL=http://localhost:3000
```

**Note**: The frontend uses Vite's proxy configuration to forward `/api` requests to the API Gateway. The proxy is configured in `vite.config.ts`.

## 🌐 Frontend Application

The React frontend provides a complete user interface for all authentication and user management features.

### Access the Frontend

- **Development**: http://localhost:5173
- **Production**: Deployed on Vercel (see [Deployment](#-deployment) section)

**Note**: The frontend includes a `vercel.json` configuration file for proper SPA routing on Vercel. This ensures that all routes are handled correctly when deployed.

### Form Validation

The frontend uses **Zod** for schema-based form validation integrated with React Hook Form:

- **Centralized schemas** - All validation rules defined in `src/schemas/validation.schemas.ts`
- **Type-safe forms** - TypeScript types automatically inferred from Zod schemas
- **Consistent validation** - Same validation rules across all forms (register, login, reset password, etc.)
- **Real-time validation** - Instant feedback on user input
- **No DTO duplication** - Single source of truth for form data types

### Dark Mode

The frontend includes a fully functional dark mode feature:

- **Automatic theme detection** based on system preferences
- **Persistent theme storage** in localStorage
- **Smooth theme transitions** with no flash on page load
- **Toggle button** positioned in the bottom-left corner (always visible)
- **Automatic CSS adaptation** - all components adapt to dark mode without manual CSS modifications

### Frontend Features

- ✅ User registration and login
- ✅ Email verification
- ✅ Resend verification email modal (when account is not verified)
- ✅ Password reset flow
- ✅ 2FA authentication setup and verification
- ✅ 2FA verification modal during login (for users with 2FA enabled)
- ✅ User profile dashboard
- ✅ Account deletion with confirmation modal
- ✅ Automatic token refresh
- ✅ Protected routes with React Router
- ✅ Persistent authentication state (Zustand)
- ✅ Automatic API request retry on 401 errors
- ✅ Form validation with Zod and React Hook Form (zodResolver)
- ✅ Type-safe form validation with inferred TypeScript types
- ✅ Centralized validation schemas (single source of truth)
- ✅ Dark mode with system preference detection
- ✅ Theme toggle with persistent storage

### Frontend Pages

- `/login` - User login page
- `/register` - User registration page
- `/verify-email` - Email verification page
- `/forgot-password` - Password reset request page
- `/reset-password` - Password reset page
- `/2fa/setup` - Two-factor authentication setup page
- `/dashboard` - User dashboard (protected)
- `*` - 404 Not Found page

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
- `DELETE /users/profile` - Delete user account

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

### Delete Account

```bash
curl -X DELETE http://localhost:3000/users/profile \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

## 🔒 Security Features

### JWT Implementation

- **Access Token**: Short-lived (configurable via `JWT_EXPIRES_IN`, default 15 minutes)
- **2FA Token**: Very short-lived (configurable via `JWT_2FA_EXPIRES_IN`, default 2 minutes)
- **Refresh Token**: Long-lived (configurable via `JWT_REFRESH_EXPIRES_IN`, default 7 days) with rotation
- **Token Storage**: Refresh tokens stored in Redis
- **Automatic Invalidation**: Tokens invalidated on logout
- **Automatic Refresh**: Frontend automatically refreshes tokens on 401 errors

### Two-Factor Authentication

- **TOTP Support**: Compatible with Google Authenticator, Authy
- **QR Code Generation**: Easy setup process
- **Encrypted Storage**: 2FA secrets encrypted in database
- **Backup Codes**: Recovery mechanism
- **Login Flow**: When users with 2FA enabled log in, they receive a temporary 2FA token and must verify their OTP code via a modal before accessing the dashboard

### Rate Limiting

- **Global Rate Limit**: 100 requests/minute (configurable via ThrottlerModule)
- **Auth Endpoints**: 4 requests/minute
- **Password Reset**: 1 request/minute
- **Email Verification Resend**: 1 request/minute
- **Redis-based**: Distributed rate limiting with `@nest-lab/throttler-storage-redis`

## 🛠️ Development

### Start Development Servers

```bash
# Terminal 1 - API Gateway
cd backend/api-gateway
npm run start:dev

# Terminal 2 - Email Service
cd backend/email-service
npm run start:dev

# Terminal 3 - Frontend
cd frontend
npm run dev
```

**Services will be available at:**

- **API Gateway**: http://localhost:3000
- **Swagger UI**: http://localhost:3000/docs
- **Frontend**: http://localhost:5173
- **RabbitMQ Management**: http://localhost:15672 (guest/guest)

The frontend will proxy API requests from `/api/*` to the API Gateway at `http://localhost:3000`.

## 🚀 Deployment

### Frontend Deployment (Vercel)

The frontend is configured for deployment on Vercel with a `vercel.json` file that handles client-side routing for the React SPA.

**Prerequisites:**

- Vercel account
- Repository connected to Vercel

**Deployment Steps:**

1. **Push the code to your repository** (the `vercel.json` file is already included)

2. **Connect your repository to Vercel** (if not already connected)

3. **Configure Environment Variables** in Vercel:

   - `VITE_API_URL`: Your API Gateway URL (e.g., `https://your-api-gateway.com`)

4. **Deploy**: Vercel will automatically detect the Vite project and deploy it

**Important Notes:**

- The `vercel.json` file ensures that all routes are handled by the React Router (prevents 404 errors on page refresh)
- Make sure to update `VITE_API_URL` to point to your production API Gateway
- The frontend will be available at your Vercel domain (e.g., `https://your-app.vercel.app`)

### Docker Deployment

The project includes Dockerfiles for both backend services (API Gateway and Email Service).

#### Individual Service Deployment

**API Gateway:**

```bash
cd backend/api-gateway
docker compose up -d
```

**Email Service:**

```bash
cd backend/email-service
docker compose up -d
```

#### Docker Compose Deployment

```bash
# Build and start all services
docker compose up -d

# View logs
docker compose logs -f

# Stop services
docker compose down
```

**Note**: The Docker Compose files use an external network. Make sure to create it:

```bash
docker network create my-custom-backend
```

### Production Considerations

- Use environment-specific configuration
- Enable SSL/TLS certificates
- Configure proper logging
- Set up monitoring and alerting
- Use secrets management
- Configure backup strategies
- Update CORS settings to allow requests from your production frontend domain
- Configure RabbitMQ and Redis for production (persistent storage, clustering, etc.)
- Set up database backups and replication

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
- [React](https://react.dev/) - UI library
- [Vite](https://vitejs.dev/) - Build tool
- [TanStack Query](https://tanstack.com/query) - Data fetching
- [Zustand](https://zustand-demo.pmnd.rs/) - State management
- [Zod](https://zod.dev/) - Schema validation

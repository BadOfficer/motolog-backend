# MotoLog — Backend

REST API for **MotoLog**, a web application for tracking vehicle service history.
Owners register their vehicles by VIN, log maintenance with parts and costs,
track mileage, and share a vehicle's history publicly, for example when selling it.

Built as my bachelor's thesis project at Igor Sikorsky Kyiv Polytechnic Institute (2026).

**Frontend:** [dyploma-motolog-frontend](https://github.com/BadOfficer/dyploma-motolog-frontend)

## Tech Stack

- **Framework:** NestJS 11, TypeScript
- **Database:** PostgreSQL 16, Prisma ORM 7 (migrations, seeding)
- **Auth:** JWT (access and refresh tokens), Google OAuth 2.0 (Passport), bcrypt
- **Validation:** class-validator, class-transformer, global `ValidationPipe`
- **File storage:** AWS S3
- **External API:** NHTSA vPIC for VIN decoding, vehicle makes, and models
- **Tooling:** Docker Compose, ESLint, Prettier

## Features

- **Authentication:** email/password sign-up and sign-in, Google OAuth, token refresh
- **Role-based access:** `USER` and `ADMIN` roles enforced with custom guards and decorators
- **Vehicles:** VIN decoding, custom `@IsVIN()` validator, mileage tracking, images,
  linking and unlinking owners with previous-owner history, public sharing
- **Service logs:** maintenance records with line items (parts, prices, quantities),
  categories, photos, and mileage validation with warnings
- **Audit trail:** logs are never edited in place. A correction creates a new log and
  marks the original as `CORRECTED`; deletion is a soft delete
- **Analytics:** mileage history and spending summary per vehicle, admin statistics
- **Admin API:** verify vehicles, manage users, categories, makes, and models

## Architecture

The app follows the NestJS modular architecture: each domain is a module with its own
controller, service, and DTOs, wired together through dependency injection.

```
src/
├── config/              # JWT configuration
├── modules/
│   ├── auth/            # JWT and Google strategies, guards, role decorators
│   ├── users/
│   ├── vehicles/        # VIN decoding, ownership, sharing
│   ├── vehicles-makes/
│   ├── vehicles-models/
│   ├── service-logs/    # logs, items, corrections
│   ├── categories/
│   ├── analytics/
│   ├── files/           # storage abstraction
│   └── http/            # global HTTP client (timeouts, redirects)
├── prisma/              # PrismaService
└── utils/, helpers/, constants/
```

File storage is defined as an abstract `FilesService`. The files module binds it to
`FilesS3Service` through DI, so the storage backend can be swapped without changing
the services that use it.

## Database

![Entity relationship diagram](prisma/ERD.svg)

Main entities: `User`, `OAuthAccount`, `Vehicle`, `Make`, `Model`, `ServiceLog`,
`ServiceLogItem`, `ServiceLogMedia`, `Category`.

## Getting Started

### Prerequisites

- Node.js 20+
- Docker (for PostgreSQL)
- AWS S3 bucket (for image uploads)
- Google OAuth credentials (for Google sign-in)

### 1. Install dependencies

```bash
npm install
```

### 2. Configure environment

Create a `.env` file in the project root:

```env
# Server
PORT=4000
FRONTEND_URL=http://localhost:3000

# Database
DB_USER=postgres
DB_PASSWORD=postgres
DB_NAME=motolog
DB_PORT=5432
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/motolog

# JWT
JWT_SECRET=your-secret
JWT_ACCESS_TTL=15m
JWT_REFRESH_TTL=7d

# Google OAuth
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=
GOOGLE_CALLBACK_URL=http://localhost:4000/auth/google/callback

# AWS S3
S3_BUCKET_NAME=
S3_REGION=
S3_ACCESS_KEY_ID=
S3_SECRET_ACCESS_KEY=

# External APIs
VIN_API_BASE_URL=https://vpic.nhtsa.dot.gov/api/vehicles

# HTTP client (optional)
HTTP_TIMEOUT=5000
HTTP_MAX_REDIRECTS=5
```

The frontend runs on port 3000, so the API needs a different port.

### 3. Start the database

```bash
docker compose up -d
```

### 4. Apply migrations and seed data

```bash
npx prisma migrate dev
npx prisma db seed
```

The seed creates the system service categories, a local admin account
(`admin@admin.com` / `Admin1234`, for local development only), and imports
vehicle makes from the NHTSA API.

### 5. Run the app

```bash
npm run start:dev
```

## API Overview

| Module | Base route | Main endpoints |
|---|---|---|
| Auth | `/auth` | `POST sign-up`, `POST sign-in`, `POST refresh`, `GET me`, `GET google` |
| Users | `/users` | create, list, update, update avatar, update password |
| Vehicles | `/vehicles` | create, `GET my`, `POST decode-vin`, update mileage and image, link/unlink owner, `GET shared/:id`, admin verify |
| Service logs | `/service-logs` | create, `PATCH :id/correct`, list by vehicle, delete |
| Categories | `/categories` | list, create, update, delete |
| Makes / Models | `/vehicles-makes`, `/vehicles-models` | list, create, delete |
| Analytics | `/analytics` | `GET vehicles/:id/mileage`, `GET vehicles/:id/summary`, `GET admin/stats` |

## Scripts

| Command | Description |
|---|---|
| `npm run start:dev` | Start in watch mode |
| `npm run build` | Build for production |
| `npm run start:prod` | Run the production build |
| `npm run lint` | Lint and fix |
| `npm run format` | Format with Prettier |

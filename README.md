# Cooking Time

Cooking Time is a full-stack web application for discovering, saving, creating, and rating recipes. Users can register, publish their own recipes, add them to favorites, follow authors, view cooking history, receive notifications, and interact with moderation features.

## Description

The project consists of two parts:

- Frontend: React + Vite + React Query + React Router
- Backend: Node.js + Express + Prisma ORM + PostgreSQL + Redis

Main features:

- user authentication and profile management
- creating, editing, and viewing recipes
- favorites, cooking history, and personalized recommendations
- comments, ratings, reports, and notifications
- admin panel for content moderation

## Dependencies

### Frontend

- React
- React DOM
- Vite
- React Router DOM
- TanStack Query
- Axios
- React Hook Form
- Radix UI components
- Zod
- Sonner

### Backend

- Express
- Prisma
- PostgreSQL driver
- Redis
- JWT / bcrypt
- Helmet, CORS, cookie-parser
- Multer and Sharp for image upload handling

## Project Structure

- client/ — frontend application
  - src/ — components, pages, context, services, and utilities
  - public/ — static assets
- server/ — backend application
  - src/ — routes, controllers, services, middleware, and configuration
  - prisma/ — Prisma schema and migrations
  - public/uploads/ — uploaded images
  - docker-compose.yaml — local PostgreSQL and Redis services

## Running the Project

To run the project, clone the repository and follow the steps below locally.

### 1. Requirements

Before starting, make sure you have:

- Git
- Node.js 20+
- npm
- Docker Desktop (for PostgreSQL and Redis)

### 2. Clone the repository

```bash
git clone https://github.com/Lis1459/Cooking-time.git
cd Cooking-time
```

### 3. Configure environment variables

Create a .env file in the server folder with the following content:

```env
PORT=3000
CLIENT_URL=http://localhost:5173
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/cooking_time_db?schema=public
REDIS_URL=redis://localhost:6379
JWT_ACCESS_SECRET=dev-access-secret
JWT_REFRESH_SECRET=dev-refresh-secret
```

### 4. Start the databases

```bash
cd server
docker compose up -d
```

### 5. Install dependencies

```bash
cd ../client
npm install

cd ../server
npm install
```

### 6. Apply database migrations

```bash
npx prisma migrate deploy
npx prisma generate
```

### 7. Start the application

Open two terminals.

In the first terminal, start the backend:

```bash
cd server
npm run dev
```

In the second terminal, start the frontend:

```bash
cd client
npm run dev
```

Then open your browser at:

```text
http://localhost:5173
```

## Useful Commands

- Run backend tests:

```bash
cd server
npm test
```

- Build the frontend:

```bash
cd client
npm run build
```

## Contributing

If you would like to contribute, we recommend:

1. create a new branch
2. make your changes
3. verify the build and tests
4. open a pull request

## License

This project is distributed under the ISC license.

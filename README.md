# Food Delivery Order Management (Assessment)

This repository implements the **Order Management** feature requested in the PDF assessment.

## Tech Stack

- Frontend: React + Vite + TypeScript + Tailwind CSS
- Backend: Node + Express + TypeScript + Socket.io
- Data: In-memory store (menu + orders)
- Testing:
  - Backend: Vitest + Supertest
  - Frontend: Vitest + React Testing Library

## Features mapped to PDF

1. Menu Display
   - Menu list includes `name`, `description`, `price`, and `image`.
2. Order Placement
   - Add items to cart
   - Change item quantity
   - Checkout with `name`, `address`, `phone`
3. Order Status
   - Status pipeline: `Order Received` -> `Preparing` -> `Out for Delivery` -> `Delivered`
   - Real-time updates via Socket.io
4. Back-End
   - REST APIs for menu retrieval, order placement, listing, lookup, and status update
   - In-memory storage with strict validation
5. TDD
   - Tests for API CRUD-ish operations, validation, and status update behavior
   - Tests for key UI components/pages
6. UI
   - Menu, Cart, Checkout, Order Tracking, and Admin/Kitchen pages
7. Real-Time updates
   - Automatic status simulation and manual admin override, both broadcast in real-time

## Project structure

- `backend/`
  - `src/app.ts` Express app
  - `src/index.ts` HTTP + Socket.io server bootstrap
  - `src/routes/` API route handlers
  - `src/store/` in-memory data modules
  - `src/simulator.ts` timed status progression
  - `src/realtime.ts` Socket.io room/event handling
- `frontend/`
  - `src/pages/` Menu, Cart, Checkout, OrderStatus, Admin
  - `src/context/CartContext.tsx` cart state
  - `src/api/client.ts` API calls
  - `src/realtime/socket.ts` client socket singleton

## API Surface

- `GET /api/menu`
- `GET /api/menu/:id`
- `POST /api/orders`
- `GET /api/orders`
- `GET /api/orders/:id`
- `PATCH /api/orders/:id/status`
- `DELETE /api/orders/:id`

## Socket events

- Client emits `join` with room:
  - `order:<orderId>` for order-tracking clients
  - `orders:all` for admin board
- Server emits `order:status` payload:
  - `{ orderId, status, updatedAt }`

## Environment variables

Backend:

- `PORT` (default: `3000`)
- `CORS_ORIGIN` (default allows local frontend; comma-separated list supported)

Frontend:

- `VITE_API_URL`
  - local recommended: `http://localhost:3000`
  - if omitted in dev, Vite proxy handles `/api` and `/socket.io`

## Local run

Install dependencies (from repo root):

```bash
npm install
```

Run backend:

```bash
npm run dev -w backend
```

Run frontend:

```bash
npm run dev -w frontend
```

Run all tests:

```bash
npm run test
```

## Deployment notes

- Frontend deploy target: Vercel or Netlify
- Backend deploy target: Render / Railway / Fly (must support websockets)
- Set frontend `VITE_API_URL` to deployed backend URL
- Set backend `CORS_ORIGIN` to deployed frontend URL

## AI usage note (for Loom discussion)

AI assistance was used for:

- task decomposition and phase planning
- boilerplate generation for routes/components/tests
- iterative test-fix loops and validation hardening

All generated code was reviewed and adapted to enforce the assessment requirements and consistent project conventions.

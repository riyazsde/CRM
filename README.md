# RiyazCRM — MERN Mini CRM

A production-style MERN mini-CRM built from scratch for a full-stack assessment.

**Developer:** Syed Riyaz  
**Stack:** React + Vite, Node.js, Express.js, MongoDB + Mongoose, JWT, bcrypt, Vitest, Jest/Supertest  
**Architecture:** Separate frontend/backend applications with REST APIs.

## Highlights

- Secure signup/signin
- Short-lived JWT access token
- Long-lived refresh token stored in an `HttpOnly` cookie
- Refresh-token rotation
- bcrypt password hashing
- Backend auth middleware
- React protected routes
- Contacts CRUD
- Search by name/email
- Status filtering
- Server-side pagination — 10 contacts/page
- Activity log for add/edit/delete
- Request validation
- Login rate limit: 3 requests / 10 minutes
- Centralized API error handling
- CSV export
- Responsive UI
- Unit/API tests
- Dockerized backend
- Postman collection
- Deployment-ready environment configuration

## Project Structure

```text
riyaz-crm/
├── backend/
│   ├── src/
│   │   ├── config/
│   │   ├── controllers/
│   │   ├── middleware/
│   │   ├── models/
│   │   ├── routes/
│   │   ├── tests/
│   │   ├── utils/
│   │   ├── app.js
│   │   └── server.js
│   ├── Dockerfile
│   ├── .env.example
│   └── package.json
├── frontend/
│   ├── src/
│   │   ├── api/
│   │   ├── components/
│   │   ├── context/
│   │   ├── pages/
│   │   ├── routes/
│   │   ├── tests/
│   │   ├── App.jsx
│   │   ├── main.jsx
│   │   └── styles.css
│   ├── .env.example
│   └── package.json
├── postman/
│   └── RiyazCRM.postman_collection.json
└── docker-compose.yml
```

## Local Setup

### 1. Backend

```bash
cd backend
cp .env.example .env
npm install
npm run dev
```

Set:

```env
PORT=5000
MONGO_URI=mongodb://127.0.0.1:27017/riyazcrm
JWT_ACCESS_SECRET=replace-with-a-long-random-secret
JWT_REFRESH_SECRET=replace-with-another-long-random-secret
CLIENT_URL=http://localhost:5173
NODE_ENV=development
```

### 2. Frontend

```bash
cd frontend
cp .env.example .env
npm install
npm run dev
```

Set:

```env
VITE_API_URL=http://localhost:5000/api
```

Open `http://localhost:5173`.

## Test Commands

Backend:

```bash
cd backend
npm test
```

Frontend:

```bash
cd frontend
npm test
```

## API Overview

### Auth

- `POST /api/auth/signup`
- `POST /api/auth/signin`
- `POST /api/auth/refresh`
- `POST /api/auth/signout`
- `GET /api/auth/me`

### Contacts

- `GET /api/contacts?page=1&limit=10&search=riya&status=Lead`
- `POST /api/contacts`
- `GET /api/contacts/:id`
- `PATCH /api/contacts/:id`
- `DELETE /api/contacts/:id`
- `GET /api/contacts/export`

### Health

- `GET /health`

## Security Design

The access token is deliberately kept in React memory instead of localStorage.

The refresh token is stored in an HttpOnly cookie so JavaScript cannot read it. Refresh-token rotation is implemented using a hashed token stored in MongoDB.

For production, HTTPS is required. The backend sets:

- `HttpOnly`
- `Secure`
- `SameSite=None` for deployed cross-origin frontend/backend
- restrictive cookie path

The frontend sends requests with `credentials: "include"`.

## Deployment

### Backend

Deploy `backend/` to a Node-compatible cloud service such as Render, Railway, Fly.io, or another platform supporting Node/Docker.

Environment variables:

```env
MONGO_URI=your_mongodb_atlas_uri
JWT_ACCESS_SECRET=...
JWT_REFRESH_SECRET=...
CLIENT_URL=https://your-frontend-domain.example
NODE_ENV=production
```

### Frontend

Deploy `frontend/` to Vercel, Netlify, Cloudflare Pages, or another Vite-compatible host.

```env
VITE_API_URL=https://your-backend-domain.example/api
```

After deployment, update backend `CLIENT_URL` to the exact frontend origin.

## Assessment Notes

This implementation intentionally demonstrates production-minded decisions rather than putting everything in one file:

- controllers contain business logic
- routes contain HTTP mapping
- models define persistence rules
- middleware handles cross-cutting concerns
- services/utils isolate token and CSV logic
- frontend context owns authentication state
- API client automatically refreshes expired access tokens
- activity logs are persisted as a separate collection

## Suggested Interview Walkthrough

1. Explain the authentication flow.
2. Explain why refresh tokens are HttpOnly.
3. Explain pagination and indexes.
4. Explain login rate limiting.
5. Explain React protected routing.
6. Explain API error handling.
7. Explain activity logging.
8. Explain deployment environment variables.

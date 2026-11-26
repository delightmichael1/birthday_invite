# Pastor's Birthday Invitation

A single-link birthday invitation with RSVP collection backed by MongoDB.

## Stack

- **Frontend:** React + Vite + Tailwind CSS v4
- **Backend:** Express API + Mongoose (MongoDB)
- **Deploy:** one Node process serves both the API and the built frontend

## Quick start

```bash
npm install
cp .env.example .env   # fill in MONGODB_URI and ADMIN_KEY
npm run dev            # web on :5173, API on :4000 (vite proxies /api)
```

## Edit the invitation

All event details live in **`src/config.js`** — pastor name, date, time,
venue, address, RSVP deadline. Payment is stubbed behind `payment.enabled`;
flip it to `true` once a provider (Stripe / Paystack / Flutterwave) is wired
in — see the `paid` / `paymentRef` fields already on the RSVP model.

## Production

```bash
npm run build
npm start              # serves dist/ + /api on PORT (default 4000)
```

Deploy to Render, Railway, Fly.io, or a VPS — set `MONGODB_URI` and
`ADMIN_KEY` as environment variables.

## MongoDB Atlas setup

1. Create a free cluster at https://cloud.mongodb.com
2. Database → Connect → Drivers → copy the connection string
3. Put it in `.env` as `MONGODB_URI` (the app creates the `rsvps` collection automatically)

## Viewing RSVPs

Open `/admin?key=YOUR_ADMIN_KEY` in the browser for a dashboard with
response counts and a table of every submission.
Or call `GET /api/rsvps?key=YOUR_ADMIN_KEY` for JSON.

## API

| Method | Path           | Description                    |
|--------|----------------|--------------------------------|
| POST   | `/api/rsvp`    | Submit an RSVP                 |
| GET    | `/api/rsvps`   | List all RSVPs (admin key)     |

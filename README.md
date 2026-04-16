# GlucoTrack 🩸

A mobile-first blood sugar tracking app for diabetes patients with a freemium model built on **React + Supabase + Stripe**.

---

## Features

| Free Tier | Premium ($4.99/mo) |
|-----------|-------------------|
| Log unlimited readings | Everything in Free |
| View last 3 days of data | Full history (unlimited) |
| mg/dL & mmol/L support | Advanced trend insights |
| Color-coded status (low/normal/high) | Data export (coming soon) |
| Glucose trend chart | Priority support |

---

## Tech Stack

- **Frontend**: React 18 + Vite
- **Styling**: Custom CSS (no Tailwind dependency needed — all styles are in `src/styles/globals.css`)
- **Charts**: Recharts
- **Auth & DB**: Supabase (PostgreSQL + RLS)
- **Payments**: Stripe Checkout + Webhooks (via Supabase Edge Functions)

---

## Project Structure

```
glucotrack/
├── index.html
├── package.json
├── vite.config.js
├── .env.example                   # ← copy to .env
├── src/
│   ├── main.jsx
│   ├── App.jsx
│   ├── styles/
│   │   └── globals.css
│   ├── lib/
│   │   ├── supabase.js            # Supabase client
│   │   └── bloodSugar.js          # Unit conversion & thresholds
│   ├── hooks/
│   │   ├── useReadings.js         # Fetch/add/delete readings, paywall logic
│   │   └── useSubscription.js     # Premium status + real-time updates
│   ├── pages/
│   │   ├── AuthPage.jsx           # Sign in / sign up
│   │   └── Dashboard.jsx          # Main app shell
│   └── components/
│       ├── ReadingForm.jsx        # Bottom-sheet log form
│       ├── ReadingsList.jsx       # History list with status colors
│       ├── GlucoseChart.jsx       # Recharts line chart
│       ├── StatsBar.jsx           # Latest reading + avg/min/max/TIR
│       └── PaywallBanner.jsx      # Upgrade prompt → Stripe Checkout
└── supabase/
    ├── migrations/
    │   └── 001_initial_schema.sql # Run once in Supabase SQL Editor
    └── functions/
        ├── create-checkout-session/index.ts   # Creates Stripe session
        └── stripe-webhook/index.ts            # Handles subscription events
```

---

## Setup Guide

### 1. Clone & Install

```bash
git clone https://github.com/yourname/glucotrack.git
cd glucotrack
npm install
```

### 2. Configure Environment Variables

```bash
cp .env.example .env
```

Edit `.env` with your credentials:

```env
VITE_SUPABASE_URL=https://your-project-id.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
```

> **Note:** Stripe keys are used in Edge Functions only — they are never exposed to the browser.

### 3. Set Up Supabase

1. Create a new project at [app.supabase.com](https://app.supabase.com)
2. Go to **SQL Editor** and paste + run the contents of `supabase/migrations/001_initial_schema.sql`
3. Copy your **Project URL** and **anon key** from **Project Settings → API** into `.env`

### 4. Deploy Supabase Edge Functions

Install the Supabase CLI:
```bash
npm install -g supabase
supabase login
supabase link --project-ref your-project-id
```

Set Edge Function secrets (these are server-side only):
```bash
supabase secrets set STRIPE_SECRET_KEY=sk_test_...
supabase secrets set STRIPE_WEBHOOK_SECRET=whsec_...
supabase secrets set STRIPE_PRICE_ID=price_...
```

Deploy the functions:
```bash
supabase functions deploy create-checkout-session
supabase functions deploy stripe-webhook
```

### 5. Set Up Stripe

1. Create a [Stripe account](https://stripe.com) (or use test mode)
2. Create a **Product** with a **recurring monthly price** (e.g. $4.99/month)
3. Copy the **Price ID** (starts with `price_`) → set as `STRIPE_PRICE_ID` secret
4. Go to **Developers → Webhooks** → **Add endpoint**
   - URL: `https://<your-project-id>.supabase.co/functions/v1/stripe-webhook`
   - Events: `customer.subscription.created`, `customer.subscription.updated`, `customer.subscription.deleted`
5. Copy the **Webhook signing secret** → set as `STRIPE_WEBHOOK_SECRET` secret

### 6. Run Locally

```bash
npm run dev
```

Open [http://localhost:5173](http://localhost:5173)

### 7. Build for Production

```bash
npm run build
```

Deploy the `dist/` folder to Vercel, Netlify, Cloudflare Pages, or any static host.

---

## Paywall Logic

The paywall is enforced **client-side** in `useReadings.js`:

1. When readings are fetched, the app checks the timestamp of the **oldest** reading.
2. If it's older than 3 days **and** the user is not premium → `showPaywall = true`.
3. The readings list is filtered to only show the last 3 days; older entries are hidden.
4. Users can **continue logging** new readings at any time.
5. After a successful Stripe subscription, the webhook sets `is_premium = true` in the `profiles` table, Supabase real-time pushes the update to the client, and the paywall disappears instantly.

> For production, consider adding a Supabase RLS policy or a separate Edge Function to enforce the 3-day limit server-side as well, preventing API manipulation by savvy users.

---

## Blood Sugar Reference Ranges

| Status | mg/dL | mmol/L |
|--------|-------|--------|
| Low    | < 70  | < 3.9  |
| Normal | 70–180 | 3.9–10.0 |
| High   | > 180 | > 10.0 |

---

## Testing Stripe (Test Mode)

Use Stripe's test card numbers:
- **Successful payment**: `4242 4242 4242 4242`
- **Declined**: `4000 0000 0000 0002`
- Any future expiry date and any 3-digit CVC

---

## License

MIT

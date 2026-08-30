# St.Mark Borg El Arab Cantine — Till App

This is the point-of-sale app for the canteen. This guide is written for
someone with **no technical background**. If a step mentions a word you
don't recognize, just follow it exactly as written.

## What this app does

There are two "sides" to the app:

- **The Till (Seller)** — this is what whoever is selling snacks uses. It
  opens automatically when you visit the site. It asks for a 4-digit PIN
  the first time you use it each session.
- **The Admin area** (`/admin`) — this is for the person managing the
  canteen: adding products, checking sales reports, and doing backups. It's
  protected by a password.

## One-time setup (only needs to be done once)

You will need two free accounts: one on **Supabase** (the database) and one
on **Vercel** (where the website lives). If someone technical already did
this for you, skip to "Changing the password or PIN" below.

### Step 1 — Create the database (Supabase)

1. Go to [supabase.com](https://supabase.com) and create a free account and
   a new project. Pick any name and password (you won't need that
   database password day-to-day).
2. Once the project is ready, open the **SQL Editor** (left sidebar) and
   click **New query**.
3. Open the file `supabase/migrations/0001_init.sql` from this project,
   copy its entire contents, paste it into the SQL editor, and click **Run**.
   This creates all the tables the app needs and a storage folder for
   product photos.
4. Go to **Project Settings → API**. You'll need two values from this page
   in Step 2:
   - **Project URL**
   - **service_role key** (click "Reveal" — keep this secret, don't share it)

### Step 2 — Put the app online (Vercel)

1. Go to [vercel.com](https://vercel.com), create a free account, and
   import this project (if it's in GitHub) or upload the folder.
2. Before the first deploy, open **Settings → Environment Variables** and
   add these four:

   | Name | Value |
   |---|---|
   | `NEXT_PUBLIC_SUPABASE_URL` | the Project URL from Step 1 |
   | `SUPABASE_SERVICE_ROLE_KEY` | the service_role key from Step 1 |
   | `ADMIN_PASSWORD` | a password you choose for the Admin area |
   | `SELLER_PIN` | a 4-digit number for the till, e.g. `1234` |

3. Click **Deploy**. After a minute or two you'll get a website address
   like `https://your-app.vercel.app` — that's your canteen's till.

That's it — the app is live.

## Using the app day-to-day

### As a seller (the till)

1. Open the website address on the phone or tablet you use for selling.
2. The first time, type the 4-digit PIN and tap Enter. You won't be asked
   again until you close the browser or clear the site.
3. From the home screen you can:
   - See all **open tabs** (running customer accounts) and search them by
     name or number.
   - Tap **New Tab** to start a tab for a customer.
   - Tap a tab to add items to it, take a payment, or close it.
   - Tap **Quick Checkout** for a simple instant sale (no tab, no name —
     just pick items and confirm).

### As the admin (the manager)

1. Go to `your-app-address/admin` and enter the admin password.
2. From there you can:
   - **Products** — add, edit, or remove items sold in the canteen, set
     prices and stock, and upload a photo for each one.
   - **Analytics** — see daily sales, best-selling items, and how much
     money is still owed on open tabs.
   - **Settings** — change the warning thresholds (see below).
   - **Backup** — download a copy of all the data, or reset the till at the
     end of the season.

### Adding the app to a phone's home screen (optional but recommended)

On the phone or tablet used at the till, open the website in Chrome or
Safari, then use the browser's "Add to Home Screen" option. It will behave
like a normal app icon after that.

## Changing the admin password or the seller PIN

1. Go to your project on [vercel.com](https://vercel.com).
2. Open **Settings → Environment Variables**.
3. Edit `ADMIN_PASSWORD` or `SELLER_PIN` and save.
4. Go to the **Deployments** tab and click **Redeploy** on the latest
   deployment (or just wait — Vercel usually prompts you). The new
   password/PIN is active after the redeploy finishes (about a minute).

## Doing a backup

Backups do **not** happen automatically — someone has to click the button.

1. Go to `/admin/backup`.
2. Click **Export JSON** to download a full copy of everything (products,
   tabs, payments, quick sales) as one file. Click **Export CSV** for a
   simpler spreadsheet-friendly copy of the tabs.
3. Save that downloaded file somewhere safe (email it to yourself, save it
   to Google Drive, etc.) before doing anything else.

You'll see a warning banner in the Admin area if the app estimates you're
using a lot of the free database storage/traffic. **This number is only an
estimate we calculate ourselves** — it is not the exact number from
Supabase's own dashboard, just an early heads-up so you're not caught by
surprise.

## Doing a reset (starting a new season/trip)

This permanently deletes all tabs, payments, and quick sales so you can
start fresh. **Products are not affected** — you won't need to re-enter
your menu.

1. **Do a backup first** (see above) — this cannot be undone.
2. Go to `/admin/backup` and click **Run Reset**.
3. Type the word `RESET` exactly (capital letters) in the box to confirm.
4. Click the reset button. All tabs, items, payments, and quick sales are
   cleared.

## Troubleshooting

- **Nothing loads / blank page**: check the device's internet connection,
  then refresh the page (pull down on mobile, or tap the browser's refresh
  button).
- **"Wrong PIN" or "Wrong password"**: double check you're typing the
  current PIN/password — see "Changing the admin password or seller PIN"
  above if you're not sure what it is.
- **A tab or product isn't showing up**: refresh the page. If it still
  doesn't appear, check with whoever manages the Supabase project that the
  database is running (Supabase free projects can pause after a week of no
  use — just open the Supabase dashboard once to wake it up).
- **Images won't upload**: make sure the photo file isn't extremely large,
  and that the device has a working internet connection. Try a different
  photo if one specific file keeps failing.
- **Still stuck**: note down exactly what you tapped and any message shown
  on screen, and pass that along to whoever set up the app.

## For the technical setup person

- Framework: Next.js 16 (App Router) + TypeScript + Tailwind v4 + shadcn/ui.
- Database: Supabase Postgres. RLS is deny-all on every table; the app only
  ever talks to the database from the server using the service-role key
  (`src/lib/supabase/server.ts`). No browser-side Supabase client exists.
- Auth: Admin uses a single shared password (`ADMIN_PASSWORD`) that sets a
  signed, httpOnly cookie (`src/lib/session.ts`, `middleware.ts`). Seller
  access is a 4-digit PIN (`SELLER_PIN`) checked once per browser session
  and cached in `sessionStorage` — this is a light gate, not a real
  authorization boundary, by design.
- i18n: `next-intl`, Arabic (`ar`, RTL) is the default locale, English
  (`en`, LTR) is a toggle. Locale is stored in a cookie, not the URL.
- Product images are resized/compressed to WebP in the browser (canvas,
  ~600px longest edge) before upload, to keep Storage and egress low.
- The "usage" warning in Admin is an app-side estimate
  (`src/lib/usage.ts`), incremented on list/image reads — it is explicitly
  **not** wired to Supabase's real billing API.
- Run `npm run build` to produce a production build; `npm run lint` for
  ESLint. Both must pass clean before shipping changes.

### Manual setup checklist (for whoever deploys this)

1. Create a Supabase project.
2. Run `supabase/migrations/0001_init.sql` in the Supabase SQL editor.
3. Confirm the `product-images` storage bucket exists (the migration
   creates it) and is public-read.
4. Set the four environment variables in Vercel (see Step 2 above) —
   `.env.example` documents them; `.env.local` is intentionally not
   committed.
5. Deploy. Re-check `/admin/products` to confirm image upload works end to
   end (uses the `/api/admin/upload` route + service-role Storage write).

# Freelance Web Studio

A React and Express application backed by MongoDB Atlas. Public pages cover services, portfolio projects, pricing, inquiries, quotation requests, consultation booking, articles, reviews and FAQs. Administrators manage customer requests and website content.

## Local setup

Use Node.js 22.12 or newer. This checkout was verified with Node.js 24.19.

```powershell
npm install
npm install --prefix server
npm install --prefix client
npm run db:check
npm run dev
```

Open http://localhost:5173. The backend listens on port 5000. Vite proxies `/api`, `/sitemap.xml` and `/robots.txt` to the backend so authentication cookies and uploaded image URLs work on the same origin.

The local `server/.env` already contains the Atlas connection and randomly generated application secrets. It is ignored by Git. The administrator email and password are `DEFAULT_ADMIN_EMAIL` and `DEFAULT_ADMIN_PASSWORD` in that file. The login page no longer contains shared or pre-filled passwords.

For a new checkout, copy `server/.env.example` to `server/.env` and `client/.env.example` to `client/.env`. Set your MongoDB connection URI, a random JWT secret of at least 32 characters and an administrator password of at least 12 characters. Production rejects the documented example secrets. Never commit environment files.

The Atlas CLI account login manages infrastructure; the application uses a separate database user. This installation has a free M0 cluster named `freelance-studio` in AWS Mumbai, a `freelance_studio` database and a database user restricted to read/write access to that database. Its network access list permits this development computer's current public IP. If that IP changes, update the access list through your logged-in CLI:

```powershell
& 'C:\Program Files (x86)\MongoDB Atlas CLI\atlas.exe' accessLists create --currentIp --projectId 6ace2f697d6acc33b5cb336a --comment 'Freelance local development'
```

Keep obsolete IP entries under review in Atlas. Do not enable access from every IP as a troubleshooting shortcut.

## Features and workflows

- Services support create, edit, publish, unpublish and delete. Drafts remain visible to administrators and are excluded from public listings and the sitemap.
- Portfolio and article editors upload PNG, JPEG or WebP images. Quotation requests accept private images or PDF briefs, up to five attachments, with a 5 MB limit per file. Files are stored in MongoDB, validated by extension, MIME type and signature, and served with explicit content types. Private documents require an administrator session or the owning client's private project code.
- Inquiries include business type, service and budget. Administrators can filter/search, reply, update status and export matching inquiries to CSV. Spreadsheet formula cells are neutralized in exports.
- Under **Client Projects**, select an inquiry or quotation request and convert it once. Add quotation scope/terms and price, move through inquiry, quotation, approved, in progress, completed or cancelled, and add client-visible updates and approved documents. Share the generated `/track#CODE` link privately. The code is displayed once; generating a replacement invalidates the previous code.
- Bookings return a private `/manage-booking#CODE` link. Clients can view, cancel or reschedule under the studio's notice policy. Administrators can change date/time, status, notes and meeting URLs, and regenerate a client code. Availability uses the studio timezone and working days. All bookings and rescheduling reserve every minute of the interval in a MongoDB transaction, preventing overlap even when slot duration changes. Cancellation releases reservations. Existing active bookings are reconciled on startup; overlapping legacy bookings must be repaired before startup can succeed.
- Website settings include logo, brand colour, tagline, contact email, social links, footer copy, timezone, working days, consultation length, notice policy and public-page SEO metadata. Article SEO fields and a dynamic sitemap are available. Article and case study Markdown renders without raw HTML.
- Administrator sessions use HttpOnly cookies. Ordinary administrators manage customers and content; owners also manage accounts and site settings. Requests pass schema validation, constrained query parsing, safe search handling, rate limits and an exact-origin CORS policy.
- Chat collects name/email, saves conversations and supports admin replies. Session codes use cryptographic random values. Replies currently synchronize through four-second polling.
- Admin content and customer lists include search and page navigation. Forms have associated labels and focus indicators; dialogs trap focus and support Escape; the chat fits a 320px viewport.

Email delivery and WhatsApp integration are intentionally deferred. `EMAIL_SERVICE_ENABLED=false` stores notification records with `deferred` status. The app does not claim these records were delivered to an inbox. Existing WhatsApp links have not been configured. Set a real meeting URL in the appointment editor before a consultation; the original seed meeting URL is a placeholder.

## Database initialization

The app seeds an empty database on first startup. Seed portfolio/review/article data is illustrative content for development and should be replaced before public launch. The missing portfolio, e-commerce, redesign and maintenance service entries are added by idempotent upserts. Existing customized entries are preserved.

```powershell
npm run seed
```

Connection failure stops startup instead of continuing with a disconnected database. `/health` returns 503 after disconnection and 200 while connected.

## Verification

```powershell
npm run build
npm test
npm run test:integration
npx playwright install chromium
npm run test:browser
```

`npm test` runs pure booking, security, upload and CSV checks without a database. Integration and browser tests require the configured MongoDB connection and seeded settings. They create uniquely identified temporary records and remove the records they own; they never drop a database. Integration tests cover actual transactions, simultaneous booking conflicts, file access, role checks, idempotent requests, lead conversion, SEO and deferred notifications. Browser tests use a built preview, verify form workflows and run selected automated accessibility rules. This is not a full WCAG certification or a load test.

Playwright can start the API and preview when ports 5000/5173 are free. If an existing server is reused, rebuild/restart it first so tests use current code. Failure screenshots/traces and verification screenshots are written to ignored `test-results/`.

See `IMPLEMENTATION_STATUS.md` for the final validation results and scope.

## Vercel deployment

The root `vercel.json` builds the Vite client and routes `/api/*`, `/health`, `/sitemap.xml` and `/robots.txt` to the Express Vercel Function in `api/index.ts`. Browser routes return `index.html`. The function opens a cached MongoDB connection on demand; the normal local server still uses `npm run dev`.

The Vercel project is `wp-final-activity`. Set production environment variables `MONGODB_URI`, `JWT_SECRET`, `DEFAULT_ADMIN_PASSWORD`, `DEFAULT_ADMIN_EMAIL`, `CLIENT_URL`, `OPENROUTER_API_KEY`, and optionally `OPENROUTER_MODEL`. The API key stays server-side. `CLIENT_URL` must match the exact HTTPS production origin. Real email delivery remains disabled. Deploy with `vercel --prod`; confirm `/health` returns `ok` before using the application. Atlas must allow Vercel's outbound connections. This deployment uses a database-specific read/write user and an Atlas `0.0.0.0/0` IP entry because Vercel does not provide a fixed egress IP on this plan; keep the password private and rotate it if exposed.

The chatbot answers studio and website questions using published services, active pricing, FAQs, and settings in MongoDB. It refuses detected off-topic prompts and falls back to published services, active prices, relevant FAQs, or booking and quotation guidance when the model is unavailable or returns an unusable answer. The free OpenRouter router may vary in quality and availability.

Vercel CLI deployment does not by itself set up GitHub automatic deployments. Connect GitHub in Vercel account settings when the account has a GitHub login connection. Code is also pushed separately to `wp_final_activity` via Git.

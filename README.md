# KTU BizConnect

KTU BizConnect is a full‑stack TypeScript marketplace and community platform for Koforidua Technical University student entrepreneurs. It helps students showcase products, discover other student businesses, learn from curated resources, participate in community discussions, and manage their vendor storefronts.

## Highlights
- **Student marketplace** with product discovery, categories, and product details.
- **Vendor portal** to manage products and view basic business stats.
- **Resources & mentorship** for entrepreneurial growth.
- **Community forum** for discussions and peer support.
- **Quick Sale** area for time‑boxed deals and auctions.
- **Local-first setup** that runs out-of-the-box without external keys.

---

## Tech Stack
- **Frontend**: React 18, TypeScript, Wouter (routing), TanStack React Query, shadcn/ui, TailwindCSS, Framer Motion
- **Backend**: Node.js, Express, TypeScript, Vite (dev middleware)
- **Shared types**: `shared/schema.ts` used by both client and server

Directory layout:
- `client/` – React app and UI components
- `server/` – Express API, dev middleware, static serving
- `shared/` – Shared TypeScript models and validators

---

## Getting Started

### Prerequisites
- Node.js 18+
- npm 9+

### Install
```bash
npm install
```

### Development
Runs the API and client (via Vite middleware) on port 5000.
```bash
npm run dev
# open http://localhost:5000
```


### What this system is
- **KTU BizConnect** is a website for KTU students to do business. Students can sell items, learn from resources, meet mentors, and discover other student businesses—all in one place.

### Who uses it
- **Buyers/Students**: People who want to look for items and learn.
- **Student Sellers (Vendors)**: Students who want to list and manage their products.
- **Admins**: Staff who manage the platform (users, vendors, resources, mentorship programs).

### What users can do (simple)
- **Browse products** with pictures, prices, and details.
- **Read learning resources** (documents, links, guides) for business growth.
- **See other student businesses** and view their profiles.
- **Join mentorship programs** by applying with their KTU email.
- **View community discussions** to learn from others.

### What vendors can do
- **Create and manage products** (add, edit, remove).
- **See a simple dashboard** with basic business stats.
- **Update business information** in settings.

### What admins can do
- **Approve and manage users and vendors**.
- **Add and manage learning resources**.
- **Create mentorship programs and manage mentors**.
- **View program applications** and email selected students.
- **Oversee marketplace activity** and keep things organized.

### How it works behind the scenes (simple)
- The system has **two main parts**:
  - The **front end** (what you see in the browser) for browsing, applying, and managing products.
  - The **back end** (the server) that stores data, checks permissions, and responds to requests.
- It uses **email codes (OTP)** to verify students when they apply to programs and ensures they use a **KTU email**.
- Some pages are **protected**, so only logged-in vendors or admins can use them.

### Why it’s reliable for a school project
- **Clear roles** (user, vendor, admin) with simple permissions.
- **Consistent design** and smooth page transitions for good user experience.
- **Strong data handling** so pages load fast and stay up to date.
- **Easy to extend** later (for example, adding payments) without changing how people use it.

### Short demo plan (3–5 minutes)
1. Show the home and product browsing.
2. Open a product and highlight pictures, price, and rating.
3. Show student businesses and open a business profile.
4. Open Resources and show a resource page.
5. Open Mentorship Hub and start an application with a KTU email.
6. Log in as a vendor, open the dashboard, and show adding or editing a product.
7. Mention the admin area: approving users, adding resources, managing programs.

### Common questions (and simple answers)
- **How do you keep student data safe?**
  - Only logged-in users can access certain pages. Vendors and admins have extra checks.
- **How do students apply for programs?**
  - They enter their details, receive a **6-digit email code**, verify it, and submit. Only **@ktu.edu.gh** emails are accepted.
- **Can this support payments later?**
  - Yes. The design allows adding payment options later without changing how the site looks.
- **What happens if the internet is slow?**
  - The app shows loading states and keeps previous data visible to give a smooth experience.

---

## Feature Overview
- **Product Discovery**
  - Search, filter, and sort products.
  - Product detail pages with images, price, stock, and ratings.
- **Vendor Management**
  - Dashboard overview (orders, products, activity).
  - Product CRUD with grid and list views.
- **Community & Learning**
  - Forum index with discussions.
  - Resources library with tags, links, and downloadable files.
  - Mentorship hub for discovery.
- **Quick Sale**
  - Create and view time‑boxed deals for rapid selling.

---

## User Capabilities (Students & Visitors)
- **Browse products** by category, search, and sort in `products-listing`.
- **View product details** with images, price, descriptions, ratings.
- **Explore student businesses** via `/student-businesses` and view profiles at `/business/:id`.
- **Access learning resources**: curated resources with tags, files, and external links.
- **Mentorship hub**: discover mentors and programs; apply to programs with OTP email verification.
- **Community discussions**: view community forum listings.
- **Quick Sale**: see active sales and view sale detail pages.

## Vendor Dashboard Capabilities
- **Authentication & access control**: vendor-only routes gated via `ProtectedRoute`.
- **Vendor overview**: key stats (products, orders summary, basic insights).
- **Product management**:
  - Create, edit, delete products.
  - Grid and list views for catalog management.
  - Filtering by status/category and sorting by price, stock, name, recency.
- **Business profile**: update vendor settings and business info.
- **Navigation shortcuts** from dashboard to orders, analytics, quick links.

## Admin Dashboard Capabilities
- **Admin authentication** with token-protected endpoints.
- **Overview & analytics**: platform stats (users, vendors, products, discussions, programs, quick sales).
- **Users management**:
  - List users, view details, and approve vendor accounts.
  - Reset flows and account status updates.
- **Vendors management**:
  - Browse vendors, view ratings and stats.
  - Oversee vendor profiles and content.
- **Resources management**:
  - Add, edit, list, and view resources with files and external links.
- **Programs & Mentors**:
  - Create and list mentorship programs.
  - Manage mentors catalogue.
  - View program applications and email selected registrants.
- **Community**:
  - View discussions and platform engagement.
- **Quick Sale**:
  - List quick-sale items, finalize a sale, and review activity.

---

## Architecture Overview
- **Routing**: `client/src/App.tsx` defines all public and protected routes via Wouter.
- **Protected pages**: `components/protected-route.tsx` gates vendor paths.
- **Data fetching**: TanStack React Query for caching, loading states, and retries.
- **Server**: `server/index.ts` sets up Express, registers API routes in `server/routes.ts`, and serves the client in dev/prod.
- **Shared types**: `shared/schema.ts` ensures end‑to‑end type safety.

---

## Demo Script (5–7 minutes)
1. **Landing & Explore**
   - Visit `/` and navigate to `/products`. Show search, filters, and sorting.
2. **Product Details**
   - Open `/products/:id` to highlight images, price, ratings, and stock.
3. **Student Businesses**
   - Go to `/student-businesses` and open a vendor at `/business/:id`.
4. **Resources & Mentorship**
   - Visit `/resources` and open `/resources/:id` to show tags/files/links.
   - Show `/mentorship` for program/mentor discovery.
5. **Community**
   - Visit `/community` to see the discussion list.
6. **Vendor Journey**
   - Log in, open `/vendor/dashboard`, then `/vendor/products/grid`.
   - Show creating/editing a product via `/vendor/products`.
7. **Quick Sale**
   - Visit `/quick-sale`, open a detail, and (optionally) show `/quick-sale/create`.

---

## Talking Points
- **Purpose**: Central hub for student entrepreneurship—discoverability, learning, and growth.
- **Experience**: Clean UI, responsive design, smooth transitions (Framer Motion).
- **Reliability**: Shared types, predictable data‑fetching with React Query.
- **Extensible**: Clear separation of client/server/shared to evolve features easily.

---

## Common Q&A
- **Q: How does routing work?**
  - A: Client routes are defined with Wouter in `client/src/App.tsx`. Vendor routes are wrapped with a `ProtectedRoute` to require authentication.

- **Q: How is data fetched and cached?**
  - A: TanStack React Query manages server state—query keys, caching, refetching, and loading/error states.

- **Q: Where are the shared models?**
  - A: `shared/schema.ts` defines common types (e.g., `Product`, `User`) imported by both client and server.

- **Q: How are files and images handled?**
  - A: The API exposes upload endpoints, and the server serves static uploads. The client references those URLs.

- **Q: Can this integrate with payments later?**
  - A: Yes. The server and client are structured to allow plugging in a provider later without changing the core UX.

- **Q: How do I run a production build?**
  - A: `npm run build` to bundle, then `npm run start` to serve on port 5000.

- **Q: How do vendor protections work?**
  - A: `ProtectedRoute` checks auth context and redirects if unauthenticated.

- **Q: What’s the quickest way to demo?**
  - A: `npm run dev`, open `/products` and `/student-businesses`, then log in and show `/vendor/dashboard` and `/vendor/products/grid`.

- **Q: What can admins do?**
  - A: Admins can log in to the admin area, view platform stats, manage users and vendors, curate resources, manage programs and mentors, view program applications and email registrants, and oversee quick sale items.

- **Q: How are program applications handled?**
  - A: Students apply from the Mentorship Hub; the system verifies email via OTP and posts the application to the server. Admins can review applications and email selected candidates.

- **Q: How are vendor products managed?**
  - A: Vendors use `/vendor/products` and `/vendor/products/grid` to add, edit, delete, and filter products with grid/list views.

---

## Scripts
- `npm run dev` – Start dev server (API + client) on port 5000
- `npm run build` – Build client and server bundles
- `npm run start` – Push DB schema and start production server
- `npm run check` – TypeScript check

---

## Environment
Example `.env` values can be placed in `.env` (see `.env.example` if present). Default dev server runs on port 5000.

---

## License
MIT

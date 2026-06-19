# Fable Frontend

A premium ebook sharing platform built with Next.js and modern web technologies.

## Live URL

[https://fable-app.vercel.app](https://fable-app.vercel.app) (example)

## Tech Stack

- **Framework:** Next.js 16 (App Router)
- **Styling:** Tailwind CSS 4
- **UI Components:** Custom Shadcn UI
- **Animations:** Framer Motion
- **State/Data:** TanStack React Query
- **Forms:** React Hook Form + Zod
- **Auth:** Better Auth (client)
- **Charts:** Recharts
- **Theme:** next-themes (Dark/Light/System)
- **HTTP:** Axios
- **Language:** JavaScript (JSX only)

## Features

### Authentication
- Email/password registration with role selection (Reader/Writer)
- Email/password login
- Google OAuth login
- 7-day session persistence
- Protected routes with role-based access

### Public Pages
- **Home Page** - Hero section with animations, featured ebooks, top writers, genre grid
- **Browse Ebooks** - Search, filter by genre, sort, pagination
- **Ebook Detail** - Cover, description, purchase logic, bookmarks, wishlist

### User Dashboard
- Profile display
- Purchase history table
- Bookmarks gallery
- Wishlist gallery

### Writer Dashboard
- Verification payment (Stripe)
- Create/edit/delete ebooks
- Publish/unpublish toggle
- Sales history with buyer info

### Admin Dashboard
- Analytics cards (Users, Writers, Ebooks, Revenue)
- Monthly revenue line chart (Recharts)
- Genre distribution pie chart (Recharts)
- User management (change role, delete)
- Ebook management (publish/unpublish, delete)
- Transaction log

### Design
- Premium typography (Playfair Display + Inter)
- Dark/Light/System theme toggle
- Fully responsive (mobile/tablet/desktop)
- Smooth Framer Motion animations
- Skeleton loading states
- Custom 404 and error boundary pages

## Setup

```bash
# Install dependencies
npm install

# Create environment file
cp .env.example .env.local

# Configure .env.local:
# NEXT_PUBLIC_BACKEND_URL=http://localhost:5000
# NEXT_PUBLIC_IMAGE_UPLOAD_API_KEY=your_imgbb_key

# Start development server
npm run dev
```

## Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| NEXT_PUBLIC_BASE_URL | Frontend URL | Yes |
| NEXT_PUBLIC_BACKEND_URL | Backend API URL | Yes |
| NEXT_PUBLIC_IMAGE_UPLOAD_API_KEY | imgBB API key for image uploads | Yes |
| NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY | Stripe publishable key | Yes |

## Project Structure

```
app/
├── layout.jsx              # Root layout (fonts, providers, navbar, footer)
├── page.jsx                # Home page
├── globals.css             # Tailwind + theme CSS variables
├── not-found.jsx           # Custom 404
├── error.jsx               # Error boundary
├── login/page.jsx          # Login with Google OAuth
├── register/page.jsx       # Register with role selection
├── browse/page.jsx         # Browse ebooks with filters
├── ebook/[id]/page.jsx     # Ebook detail
├── bookmarks/page.jsx      # Bookmarks
├── wishlist/page.jsx       # Wishlist
└── dashboard/
    ├── layout.jsx          # Dashboard layout with sidebar
    ├── page.jsx            # Redirects based on role
    ├── user/page.jsx       # User dashboard
    ├── writer/page.jsx     # Writer dashboard
    ├── writer/create/      # Create ebook
    ├── writer/[id]/edit/   # Edit ebook
    └── admin/page.jsx      # Admin dashboard
components/
├── ui/                     # Shadcn UI components
├── layout/                 # Navbar, Footer, Sidebar
├── home/                   # Hero, Featured, Writers, Genres
├── ThemeProvider.jsx       # next-themes wrapper
└── ModeToggle.jsx          # Theme toggle button
```

## Deployment

- **Platform:** Vercel
- **Build:** `npm run build`
- **Environment:** Set all env vars in Vercel dashboard
- **Backend:** Ensure NEXT_PUBLIC_BACKEND_URL points to deployed backend

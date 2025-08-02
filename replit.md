# Overview

TTMS (Track, Target, Manage, Succeed) is a collaborative financial management application designed for couples to manage their household finances together. The application provides real-time expense tracking, budget goal setting, shopping list management, and financial analytics in a mobile-first interface. Built as a full-stack web application with modern React frontend and Express backend, TTMS enables couples to synchronize their financial activities and work toward shared financial goals.

# User Preferences

Preferred communication style: Simple, everyday language.

# System Architecture

## Frontend Architecture
The client-side application is built with React and TypeScript, using a component-based architecture with modern UI patterns. The frontend uses Vite as the build tool and development server, providing fast hot module replacement and optimized production builds. The application follows a mobile-first design approach using TailwindCSS for styling and shadcn/ui components for consistent UI elements.

**State Management**: TanStack Query (React Query) handles server state management, providing caching, background updates, and optimistic updates for API interactions. Local component state is managed with React hooks.

**Routing**: Wouter provides lightweight client-side routing with a simple API that keeps the bundle size minimal.

**Form Handling**: React Hook Form with Zod validation ensures type-safe form management with minimal re-renders and robust validation.

## Backend Architecture
The server uses Express.js with TypeScript in a RESTful API architecture. The application follows a layered approach with clear separation between routing, business logic, and data access.

**API Structure**: RESTful endpoints organized by feature domains (auth, households, transactions, categories, budget goals, shopping items). Each route includes proper authentication middleware and error handling.

**Database Layer**: Drizzle ORM provides type-safe database operations with PostgreSQL, using a schema-first approach that ensures compile-time type safety between the database and application code.

**Session Management**: Express sessions with PostgreSQL storage handle user authentication state, providing persistent login across browser sessions.

## Authentication System
The application uses Replit's OpenID Connect (OIDC) authentication system with Passport.js integration. This provides secure, managed authentication without requiring custom user registration flows.

**Session Storage**: Sessions are stored in PostgreSQL using connect-pg-simple, ensuring session persistence and scalability.

**Authorization**: Route-level middleware checks authentication status and provides user context for authorized operations.

## Data Architecture
The database schema supports multi-user households with role-based access and comprehensive financial tracking.

**Core Entities**:
- Users: Profile information synced from Replit auth
- Households: Shared financial spaces for couples
- Categories: Organized expense and income classification
- Transactions: Financial entries with user and category associations
- Budget Goals: Monthly spending targets per category
- Shopping Items: Collaborative shopping lists with priority and price estimates

**Relationships**: The schema uses foreign key relationships to maintain data integrity, with households serving as the central organizing unit for all financial data.

## Mobile-First Design
The application prioritizes mobile experience with responsive design patterns, touch-friendly interactions, and bottom navigation for easy thumb access. The UI adapts gracefully to larger screens while maintaining mobile optimization.

# External Dependencies

## Database and Storage
- **Neon Database**: Serverless PostgreSQL database providing scalable, managed database hosting
- **Drizzle ORM**: Type-safe database client with schema management and migrations

## Authentication
- **Replit Auth**: OpenID Connect authentication provider handling user registration and login
- **Passport.js**: Authentication middleware for Express integration

## Frontend Libraries
- **React**: Component-based UI framework with hooks
- **TanStack Query**: Server state management and caching
- **Wouter**: Lightweight client-side routing
- **React Hook Form**: Form state management with validation
- **Zod**: Runtime type validation and schema definition
- **TailwindCSS**: Utility-first CSS framework
- **Radix UI**: Accessible component primitives for shadcn/ui

## Development Tools
- **Vite**: Frontend build tool and development server
- **TypeScript**: Static type checking for JavaScript
- **ESBuild**: Fast JavaScript bundler for production builds

## Session and State Management
- **connect-pg-simple**: PostgreSQL session store for Express sessions
- **Express Session**: Server-side session management middleware
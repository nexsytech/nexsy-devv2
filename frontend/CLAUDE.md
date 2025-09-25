# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Development Commands

- **Development server**: `npm run dev` - Starts Vite dev server
- **Build**: `npm run build` - Creates production build
- **Lint**: `npm run lint` - Runs ESLint for code quality checks
- **Preview**: `npm run preview` - Preview production build locally

## Architecture Overview

This is a React + Vite application that communicates with the Base44 API using the Base44 SDK. The app is an advertising platform for product promotion and campaign management.

### Key Technologies
- **Frontend**: React 18, Vite, TailwindCSS
- **UI Components**: Radix UI primitives with shadcn/ui styling (New York variant)
- **Routing**: React Router DOM v7 with centralized page management
- **API Client**: Base44 SDK (`@base44/sdk`) with authentication
- **State Management**: React hooks, no external state library
- **Icons**: Lucide React
- **Styling**: TailwindCSS with CSS variables

### Project Structure

- **`src/api/`**: Base44 SDK client configuration and entity exports
  - `base44Client.js`: SDK client setup with app ID and auth requirements
  - `entities.js`: Exports for all Base44 entities (User, BusinessProfile, etc.)
  - `functions.js`, `integrations.js`: Additional SDK exports
- **`src/components/`**: Reusable components
  - `ui/`: shadcn/ui components (buttons, dialogs, forms, etc.)
  - `dashboard/`: Dashboard-specific components
  - `product/`: Product-related components
- **`src/pages/`**: Page components for different routes
  - `index.jsx`: Central routing configuration with `PAGES` object
  - `Layout.jsx`: Main layout with navigation, auth, and Facebook SDK integration
- **`src/hooks/`**: Custom React hooks
- **`src/lib/`**: Utility functions
- **`src/utils/`**: Additional utilities

### Authentication & Navigation

- Authentication handled via Base44 SDK with automatic redirect to Landing page for unauthenticated users
- Public pages: Landing, ForgotPassword, PrivacyPolicy, TermsOfService
- Navigation managed through `Layout.jsx` with responsive sidebar
- Route management centralized in `src/pages/index.jsx` with dynamic page detection

### API Integration

- Base44 SDK configured with app ID: `686c33f785c9c65f2e6ea751`
- Authentication required for all API operations
- Entities include: BusinessProfile, VisualLibrary, MarketingStrategy, SimplifiedProduct, CreativeOutput, ConnectedAccount, OAuthState, LaunchJob

### Path Aliases

Uses Vite path resolution with `@/` pointing to `src/`:
- `@/components` → `src/components`
- `@/api` → `src/api` 
- `@/pages` → `src/pages`
- `@/lib` → `src/lib`
- `@/hooks` → `src/hooks`
- `@/utils` → `src/utils`

### External Integrations

- Facebook SDK integration for advertising platform connectivity
- Meta domain verification configured
- TikTok callback handling for social media integration
# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Development Commands

- Install dependencies: `npm install`
- Start development server: `npm run dev` (runs Vite at http://localhost:3000)
- Build for production: `npm run build`
- Preview production build: `npm run preview`
- Lint code: `npm run lint` (runs ESLint on the `src` directory)

Note: There are no test scripts configured in this project. If testing is required, consider adding Vitest or Jest with React Testing Library.

## Project Structure and Architecture

### Technology Stack
- **Build Tool**: Vite
- **Framework**: React 18 with TypeScript
- **Styling**: Tailwind CSS with shadcn-ui component library
- **State Management**: 
  - React Context API for global state (auth, language, theme, user preferences, etc.)
  - Tanstack React Query for server state and data fetching
- **Routing**: React Router v6
- **API Layer**: Supabase (via `@supabase/supabase-js`)

### Directory Structure
```
src/
├── components/          # Reusable UI components and domain-specific components
├── components/ui/       # Customized shadcn-ui components (wrappers)
├── contexts/            # React context providers (Auth, Language, Theme, etc.)
├── data/                # Static data (translations, country/region data)
├── integrations/        # Third-party service configurations (e.g., Supabase client)
├── lib/                 # Utility functions and helpers
├── pages/               # Page components, organized by section
│   ├── food/            # Food-related pages
│   └── account/         # Account-related pages
├── hooks/               # Custom React hooks encapsulating business logic
├── types/               # TypeScript declarations and interfaces
├── App.tsx              # Main application component with routing setup
├── main.tsx             # Entry point (not shown in file listing but implied by Vite standard)
└── vite-env.d.ts        # Vite TypeScript definitions
```

### Routing Structure
The application uses React Router v6 with the following route groups:
- **Root (`/`)**: Splash page
- **Store Section (`/store/*`)**: Product browsing, authentication, cart, checkout, orders, admin/dashboard, seller dashboard, etc.
- **Food Section (`/food/*`)**: Food-specific pages (if applicable)
- **TableFlow (`/table` and `/kitchen`)**: In-table QR menu and kitchen display system
- **Global Routes**: `/auth`, `/account/dashboard`, `/admin`, `/seller`, etc., accessible from both sections

### Key Architectural Patterns
1. **Context Providers**: Wrap the application in multiple providers for cross-cutting concerns:
   - `AuthProvider`: Manages user authentication state
   - `LanguageProvider`: Handles internationalization and language switching
   - `ThemeProvider`: Controls dark/light mode and theme variables
   - `ToastProvider` and `Sonner`: For toast notifications
   - `QueryClientProvider`: For React Query state management
   - Additional providers for user data, loyalty, etc.

2. **Code Splitting**: Lazy loading of routes via `React.lazy()` and `Suspense` for performance.

3. **Component Organization**:
   - UI primitives (buttons, inputs, modals) are sourced from shadcn-ui and customized in `components/ui/`
   - Domain-specific components (forms, cards, widgets) live directly in `components/`
   - Page components represent full views and are routed in `App.tsx`

4. **Data Fetching**: Primarily handled by Tanstack React Query with custom hooks in `hooks/` that encapsulate query logic.

5. **Styling**: Tailwind CSS utility-first approach with custom typography via `@tailwindcss/typography`.

### Getting Started
1. Clone the repository
2. Run `npm install` to install dependencies
3. Use `npm run dev` to start the development server
4. Make changes to files under `src/`; the development server will hot-reload updates
5. To build for production, run `npm run build` and preview with `npm run preview`

### Code Style and Linting
- ESLint is configured with plugins for React, React Hooks, and TypeScript
- Run `npm run lint` to check for linting errors
- Prettier configuration may be inferred from editor settings; check for `.prettierrc` if needed

Note: This file should be updated as the project evolves to reflect changes in setup, architecture, or development practices.
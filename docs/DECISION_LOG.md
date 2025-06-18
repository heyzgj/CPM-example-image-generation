# Architecture Decision Record (ADR) Log

| ID   | Title                                                         | Status   |
|------|---------------------------------------------------------------|----------|
| 000  | Initialise project with Next.js 14 / Prisma / Supabase / Vercel | Accepted |
| 001  | Support only preset art-style presets, no custom references   | Accepted |
| 002  | Web-only deployment (no native mobile in v1)                  | Accepted |
| 003  | Bring-your-own Gemini API key; no server-side key storage      | Accepted |
| 004  | Single image upload only; batch processing deferred            | Accepted |

> ## Context  
> To reduce scope and simplify UX, we will only allow a single image upload and preset style selection in the initial release.  
>
> ## Decision  
> Constrain v1 to web-only, single-image, preset-only workflows with client-side API key storage.  
>
> ## Consequences  
> - Faster time-to-market with fewer edge cases.  
> - Later versions can iterate on batch uploads, custom styles, and mobile apps.

# Decision Log

## ADR-001: Project Initialization & Tech Stack Selection
**Status:** Accepted  
**Context:** Initializing Gemini 2.0 Flash Image Generation App  

### Decision
Selected the following tech stack based on PRD and technical specifications:

**Frontend Framework:**
- Next.js 14 with App Router (latest stable)
- TypeScript with strict mode
- Tailwind CSS with shadcn/ui component library

**State Management:**
- TanStack React Query for server state (replaced deprecated react-query)
- Zustand for client-side state management

**Data & Validation:**
- Zod schemas for type-safe validation
- IndexedDB via idb library for client-side storage
- Web Crypto API for secure API key encryption

**Development Tools:**
- ESLint + Prettier for code quality
- Official Vercel Next.js template as base

### Rationale
1. **Next.js 14**: Matches requirements, provides optimal performance and SEO
2. **shadcn/ui**: Modern, accessible components that align with style guide
3. **TanStack Query**: Industry standard for server state, better than deprecated react-query
4. **IndexedDB**: Required for client-side storage per security requirements
5. **Web Crypto API**: Native browser encryption for API key security
6. **Vercel Deployment**: Specified in requirements, seamless integration

### Consequences
- **Positive**: Modern, performant, secure architecture
- **Positive**: Strong TypeScript integration throughout
- **Positive**: Excellent developer experience with shadcn/ui
- **Negative**: Learning curve for team members new to App Router
- **Mitigation**: Comprehensive documentation and gradual adoption

### Implementation
- ✅ Next.js 14 scaffolded with TypeScript and Tailwind
- ✅ shadcn/ui initialized with New York style
- ✅ Core dependencies installed
- ✅ Zod schemas defined for data models
- ✅ Project structure organized per requirements

## ADR-002: Core Application Architecture Patterns
**Status:** Accepted  
**Context:** Completing T001 - Core Infrastructure Setup  

### Decision
Established the following architectural patterns for the application:

**Component Architecture:**
- Feature-based folder structure in `src/`
- Providers pattern for global state (React Query, error boundaries)
- Atomic design with shadcn/ui components
- Consistent TypeScript interfaces throughout

**State Management:**
- Zustand store with persistence for local state
- React Query for server state and caching
- Clear separation between UI state and business logic

**Error Handling:**
- Global error boundary at app level
- Graceful error states with user-friendly messages
- Development vs production error visibility

**File Organization:**
- `/components` - Reusable UI components
- `/lib` - Utilities, schemas, constants
- `/app` - Next.js App Router pages
- Consistent naming conventions

### Rationale
1. **Modularity**: Each feature is self-contained and testable
2. **Scalability**: Architecture supports growing team and features
3. **Developer Experience**: Clear patterns reduce cognitive load
4. **User Experience**: Graceful error handling and loading states
5. **Maintainability**: TypeScript provides compile-time safety

### Consequences
- **Positive**: Clean, maintainable codebase foundation
- **Positive**: Easy to onboard new developers
- **Positive**: Consistent patterns across features
- **Positive**: Ready for rapid feature development
- **Trade-off**: Initial setup time investment pays off in long-term velocity

### Implementation Results
- ✅ Beautiful landing page with clear user journey
- ✅ Navigation component with proper routing to all sections
- ✅ Upload, Settings, History page scaffolds
- ✅ Global error boundary with dev/prod modes
- ✅ Zustand store with proper state management
- ✅ File validation utilities and constants
- ✅ Build system passing with zero linting errors
- ✅ **Ready for T002 - API Key Management System**
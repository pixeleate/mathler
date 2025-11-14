# Mathler - Mathematical Wordle Game

A mathematical puzzle game inspired by Wordle, where players guess equations to reach a target number. Built with Next.js, TypeScript, and Tailwind CSS.

## 🎮 How to Play

1. **Objective**: Create a 6-character mathematical equation that equals the target number
2. **Guesses**: You have 6 attempts to find the correct equation
3. **Feedback**: After each guess, tiles change color to guide you:
   - 🟢 **Green**: Correct number/operator in the correct position
   - 🟡 **Yellow**: Correct number/operator in the wrong position
   - ⚫ **Gray**: Number/operator not in the equation

https://github.com/user-attachments/assets/8cf440b2-e5ea-4ae3-98f5-9b6960bb63b9

## 🚀 Getting Started

### Prerequisites

- Node.js 18+ or Bun
- Modern web browser

### Installation

```bash
# Install dependencies
bun install

# Start development server
bun run dev

# Open http://localhost:3000 in your browser
```

### Available Scripts

```bash
# Development
bun run dev          # Start development server
bun run build        # Build for production
bun run start        # Start production server

# Code Quality
bun run lint         # Run linter
bun run format       # Format code
bun run test         # Run tests
bun run test:ui      # Run tests with UI
```

## 🏗️ Architecture

### Core Components

- **Game**: Main game component with state management
- **GameBoard**: 6x6 grid display for guesses
- **Tile**: Individual tile component with color feedback
- **VirtualKeyboard**: Input interface for numbers and operators
- **GameStats**: Statistics modal with win rates and guess distribution

### Key Features

- ✅ **Equation Validation**: Proper mathematical syntax and order of operations
- ✅ **Color-Coded Feedback**: Visual hints for correct/incorrect guesses
- ✅ **Daily Puzzles**: Deterministic daily target numbers
- ✅ **Statistics Tracking**: Win rates, streaks, and guess distribution
- ✅ **Responsive Design**: Mobile-first design with smooth animations
- ✅ **Keyboard Support**: Both virtual and physical keyboard input
- ✅ **Dark Mode**: Automatic dark/light theme support
- ✅ **Persistence**: Game state and statistics saved locally
- ✅ **Web3 Integration**: User authentication and NFT achievements

### Technical Stack

- **Framework**: Next.js 15 with App Router
- **Language**: TypeScript
- **Styling**: Tailwind CSS v4
- **Testing**: Vitest with jsdom
- **Linting**: Biome
- **Package Manager**: Bun

## 🌐 Web3 Integration

### Dynamic SDK

Mathler uses [Dynamic](https://www.dynamic.xyz) for seamless Web3 user authentication and wallet management:

- **User Authentication**: Social login and email/password authentication without requiring users to manage private keys
- **Embedded Wallets**: Automatic wallet creation for each user, enabling Web3 features without complex onboarding
- **Metadata Storage**: Game history, statistics, and NFT status stored securely in user profiles
- **Wallet Integration**: Wagmi integration for Avalanche Fuji testnet support

Users can connect their wallet or create an embedded wallet automatically when they first log in. All game history and achievements are stored in their Dynamic user profile.

### Crossmint

NFT achievements are powered by [Crossmint](https://www.crossmint.com), a no-code NFT minting platform:

- **First Win NFT**: Automatically minted to the user's embedded wallet when they solve their first equation
- **Verification**: NFT minting is verified on-chain before marking as complete
- **Blockchain**: Currently deployed on Avalanche Fuji testnet
- **Metadata**: Each NFT includes achievement details, game information, and minting date

The NFT appears as a medal icon next to the Mathler logo once successfully minted, and users can view their achievement NFT in a modal.

## 🧪 Testing

The project includes comprehensive tests for core game logic:

```bash
# Run all tests
bun run test

# Run tests with UI
bun run test:ui
```

Tests cover:

- Equation validation and evaluation
- Mathematical operations and order of operations
- Edge cases and error handling

## 🎯 Game Logic

### Equation Rules

- Must be 3-6 characters long
- Must start and end with numbers
- Can contain: `0-9`, `+`, `-`, `×`, `÷`
- No consecutive operators
- No division by zero
- Follows proper order of operations (PEMDAS/BODMAS)

### Daily Target Generation

- Uses current date as seed for deterministic daily targets
- Ensures solvable equations exist for each target
- Resets at midnight local time

## 🎨 Design Features

- **Responsive Grid**: Adapts to different screen sizes
- **Smooth Animations**: Bounce effects for tile reveals
- **Color Accessibility**: High contrast colors for visibility
- **Touch Friendly**: Large touch targets for mobile
- **Keyboard Navigation**: Full keyboard support

## 🏛️ Architectural Decisions & Production Readiness

This section documents key architectural decisions made during development and outlines improvements needed for production deployment.

### Key Architectural Decisions

#### 1. **State Management: Zustand with Persistence**

- **Decision**: Used Zustand for global state management with `persist` middleware for local storage
- **Rationale**:
  - Lightweight alternative to Redux with minimal boilerplate
  - Built-in persistence for game stats and state
  - Excellent TypeScript support
  - Simple API that fits the game's state needs
- **Trade-offs**:
  - Less ecosystem support compared to Redux
  - Persistence is client-side only (stats not synced across devices)

#### 2. **Client-Side Rendering for User-Dependent UI**

- **Decision**: Implemented `isClient` flag to prevent hydration mismatches with user-dependent components
- **Rationale**:
  - Dynamic SDK hooks (`useDynamicContext`, `useIsLoggedIn`) return different values during SSR vs client hydration
  - Prevents React hydration errors that break the app
  - Ensures consistent initial render between server and client
- **Implementation**: All user-dependent UI (NFT badge, history button, connect/logout) conditionally renders only after `isClient === true`

#### 3. **Background NFT Minting**

- **Decision**: NFT minting runs asynchronously in the background without blocking UI
- **Rationale**:
  - NFT minting can take 10-20 seconds (polling Crossmint API)
  - Game should remain playable even if NFT minting fails
  - Better UX - users don't wait for blockchain operations
- **Implementation**: Uses `setTimeout` and promise chains to run minting after game state updates

#### 4. **React Query for Data Fetching**

- **Decision**: Used TanStack Query (React Query) for equation fetching
- **Rationale**:
  - Built-in caching and stale-while-revalidate pattern
  - Automatic retry logic and error handling
  - Reduces boilerplate compared to manual fetch/state management
  - Daily equations cached for 24 hours, random equations not cached
- **Trade-offs**: Adds bundle size, but provides significant developer experience benefits

#### 5. **Database Strategy: SQLite → Turso with Drizzle ORM**

- **Decision**: SQLite for local development, Turso (LibSQL) for production using Drizzle ORM
- **Rationale**:
  - SQLite provides zero-config local development
  - Turso offers edge-distributed SQLite for production scalability
  - Drizzle ORM provides type-safe queries and better performance than Prisma
  - Same Drizzle schema works for both local and production
  - Cost-effective for read-heavy workloads (daily equation lookups)
- **Trade-offs**:
  - SQLite has write concurrency limitations (acceptable for this use case)
  - Requires connection pooling strategy for production

#### 6. **Web3 Integration: Dynamic SDK + Crossmint**

- **Decision**: Dynamic for auth/wallets, Crossmint for NFT minting
- **Rationale**:
  - Dynamic provides seamless Web3 onboarding without private key management
  - Crossmint handles blockchain complexity (IPFS, gas, transaction management)
  - Reduces development time and infrastructure complexity
- **Trade-offs**:
  - Vendor lock-in to Dynamic and Crossmint
  - Limited customization of wallet UX
  - Crossmint staging API used (needs production migration)

#### 7. **Refs Pattern for Event Handlers**

- **Decision**: Used `useRef` extensively to avoid dependency issues in `useEffect`
- **Rationale**:
  - Prevents unnecessary re-renders and effect re-runs
  - Allows access to latest values without adding dependencies
  - Common pattern for event listeners and callbacks
- **Example**: Keyboard event handlers use refs to access latest game state

### Production Readiness Improvements

#### 🔴 Critical (Must Have Before Production)

1. **Error Monitoring & Logging**

   - **Current State**: Basic `console.error` statements
   - **Needed**:
     - Integrate error tracking service (Sentry, LogRocket, or similar)
     - Structured logging with log levels
     - Error boundaries for React error handling
     - API error tracking and alerting

2. **Environment Variable Validation**

   - **Current State**: Environment variables accessed without validation
   - **Needed**:
     - Runtime validation using `zod` or similar
     - Fail-fast on missing required variables
     - Clear error messages for misconfiguration

3. **API Rate Limiting**

   - **Current State**: No rate limiting on API routes
   - **Needed**:
     - Rate limiting middleware for `/api/equations/*` routes
     - Rate limiting for `/api/nft/mint` (prevent abuse)
     - IP-based and user-based rate limits

4. **Database Connection Pooling**

   - **Current State**: Direct Drizzle ORM usage with LibSQL client
   - **Needed**:
     - Connection pooling for Turso/LibSQL
     - Connection retry logic
     - Health checks and connection monitoring
     - Consider connection pool configuration for production workloads

5. **Security Hardening**

   - **Current State**: Basic input validation
   - **Needed**:
     - Input sanitization for user metadata
     - CORS configuration for API routes
     - CSRF protection
     - Request size limits
     - Validate wallet addresses and user IDs server-side

6. **Crossmint Production Migration**
   - **Current State**: Using Crossmint staging API
   - **Needed**:
     - Migrate to production Crossmint API
     - Update environment variables
     - Test end-to-end NFT minting flow
     - Update blockchain from Avalanche Fuji testnet to mainnet (if applicable)

#### 🟡 Important (Should Have Soon)

7. **Testing Coverage**

   - **Current State**: Basic unit tests for math utilities
   - **Needed**:
     - Integration tests for API routes
     - Component tests for game logic
     - E2E tests for critical user flows (gameplay, NFT minting)
     - Test coverage reporting (aim for 80%+)

8. **Performance Optimization**

   - **Current State**: Basic optimizations
   - **Needed**:
     - Code splitting for Web3 libraries (large bundle size)
     - Image optimization for NFT images
     - Database query optimization and indexing
     - React.memo for expensive components
     - Lazy loading for modals and non-critical components

9. **Caching Strategy**

   - **Current State**: React Query caching only
   - **Needed**:
     - CDN caching for static assets
     - API response caching (daily equations are deterministic)
     - Service worker for offline support (optional)

10. **Analytics & Monitoring**

    - **Current State**: No analytics
    - **Needed**:
      - User analytics (game completion rates, average guesses)
      - Performance monitoring (Core Web Vitals)
      - NFT minting success/failure rates
      - Error rate tracking

11. **Documentation**
    - **Current State**: Basic README
    - **Needed**:
      - API documentation
      - Deployment guide
      - Environment variable reference
      - Architecture decision records (ADRs)
      - Contributing guidelines

#### 🟢 Nice to Have (Future Enhancements)

12. **CI/CD Pipeline**

    - Automated testing on PRs
    - Automated deployments
    - Build optimization checks
    - Security scanning

13. **Database Migrations Strategy**

    - Migration rollback procedures
    - Zero-downtime migration strategy
    - Backup and recovery procedures

14. **Multi-chain Support**

    - Support for multiple blockchains beyond Avalanche
    - User preference for blockchain selection
    - Cross-chain NFT compatibility

15. **Enhanced Game Features**

    - Leaderboards
    - Social sharing
    - Difficulty levels
    - Custom game modes
    - Achievement system beyond first win NFT

16. **Accessibility Improvements**
    - ARIA labels and roles
    - Keyboard navigation improvements
    - Screen reader support
    - Focus management

### Known Limitations

1. **Single Device Persistence**: Game stats stored locally, not synced across devices
2. **No Offline Support**: Requires internet connection for equation fetching
3. **Testnet Only**: Currently deployed on Avalanche Fuji testnet
4. **Limited Error Recovery**: NFT minting failures are logged but not retried automatically
5. **No User Feedback for NFT Status**: Users don't see real-time NFT minting progress

### Migration Checklist for Production

- [ ] Set up error monitoring (Sentry/LogRocket)
- [ ] Implement environment variable validation
- [ ] Add rate limiting to API routes
- [ ] Configure database connection pooling
- [ ] Migrate Crossmint to production API
- [ ] Update blockchain to mainnet (if applicable)
- [ ] Add comprehensive test coverage
- [ ] Set up CI/CD pipeline
- [ ] Configure CDN and caching
- [ ] Add analytics and monitoring
- [ ] Security audit and penetration testing
- [ ] Load testing for expected traffic
- [ ] Documentation completion
- [ ] Backup and disaster recovery plan

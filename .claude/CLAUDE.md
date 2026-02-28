In all interactions and commit messages, be extremely concise.

## What NOT to Do

- Do not introduce new libraries without being asked
- Do not bypass the feature structure
- Do not mix data access, queries, and UI responsibilities
- Do not guess API behavior—ask if unclear

## When Unsure

If requirements are ambiguous:
1. Make the smallest reasonable assumption
2. Leave a short comment explaining the assumption
3. Ask a clarifying question if the decision is impactful


## TypeScript Rules

- Avoid `any`
- Prefer explicit return types for exported functions
- Keep types close to usage unless shared within the feature
- No implicit `any` or unsafe casts

## Next.js Conventions

- Use the **App Router** (`/app`) exclusively
- Prefer **Server Components by default**
- Only add `"use client"` when required (event handlers, state, effects, Mantine components that require client rendering)
- Use **Server Actions** for mutations when possible
- Avoid legacy APIs (`pages/`, `getServerSideProps`, etc.)

## Mantine Conventions

- Use Mantine components instead of custom HTML elements where possible
- Use Mantine layout primitives (`Container`, `Stack`, `Group`, `Grid`)
- Use Mantine theming (`theme`, `useMantineTheme`) instead of hard-coded values
- Prefer Mantine props (`mt`, `px`, `c`, `fw`, etc.) over inline styles
- Avoid external UI libraries unless explicitly requested

## Styling Rules

Do NOT use:
- Tailwind
- CSS-in-JS libraries outside Mantine
- Inline styles (unless unavoidable)

Use:
- Mantine style props
- Mantine theme
- `sx` sparingly

## Accessibility

- Use semantic components
- Ensure keyboard accessibility
- Label inputs correctly
- Rely on Mantine’s built-in a11y features

## Code Quality Guidelines

- Prefer clarity over cleverness
- Avoid premature abstraction
- Do not refactor unrelated code
- Follow existing patterns within the feature

## Component Guidelines

- Keep components **small and focused**
- Prefer **composition over configuration**
- Extract reusable UI into `/components`
- Co-locate component files when practical
- Use clear, descriptive component names

## Project Structure

All application code lives under `src`.

### High-Level Rules

- **All domain logic must live inside a feature**
- Features should be **independent and self-contained**
- Cross-feature imports should be avoided where possible
- Shared, truly generic code may live outside `features` only if explicitly intended


#### `dal.ts` (Data Access Interface / Layer)

- Responsible for **raw API calls**
- No React, no TanStack Query
- No UI concerns
- Pure async functions

Example responsibilities:
- HTTP requests
- Request/response mapping
- Low-level error handling

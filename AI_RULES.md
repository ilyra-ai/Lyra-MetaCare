# AI Development Rules

This document describes the technology stack and specific library usage guidelines for this Next.js application. Adhering to these rules will help maintain consistency, improve collaboration, and ensure the AI ​​assistant can effectively understand and modify the codebase.

## Technology Stack Overview

The application was developed using the following core technologies:

* **Framework**: Next.js (App Router)
* **Language**: TypeScript
* **UI Components**: Shadcn/UI - A collection of reusable UI components developed with Radix UI and Tailwind CSS.
* **Styling**: Tailwind CSS - A utility CSS framework for rapid UI development.
* **Icons**: Lucide React - A comprehensive library of simply beautiful SVG icons.
* **Forms**: React Hook Form for managing form state and validation, typically with Zod for schema validation. * **State Management**: Primarily the React Context API and React's built-in hooks (`useState`, `useReducer`).
* **Notifications/Toasts**: Sonner for displaying non-intrusive notifications.
* **Charts**: Recharts for data visualization.
* **Animation**: `tailwindcss-animate` and animation features built into Radix UI components.

## Library Usage Guidelines

To ensure consistency and leverage your chosen stack effectively, follow these rules:

1. **UI Components**:
* **Main Choice**: Always prioritize using components from the `src/components/ui/` directory (Shadcn/UI components).
* **Custom Components**: If a required component is not available in Shadcn/UI, create a new component in `src/components/` following Shadcn/UI composition standards (i.e., based on Radix UI primitives and styled with Tailwind CSS).
* **Avoid**: Introduce new third-party UI component libraries without discussion.

2. **Styling**:
* **Main Choice**: Use exclusively Tailwind CSS utility classes for all styling.
* **Global Styles**: Reserve `src/app/globals.css` for base Tailwind directives, CSS global variable definitions, and minimal base styling. Avoid adding component-specific styles here.
* **CSS-in-JS**: Do not use CSS-in-JS libraries (e.g., Styled Components, Emotion).

3. Icons:
* Top Choice: Use icons from the lucide-react library.

4. Forms:
* Management: Use react-hook-form for all form logic (state, validation, submission).
* Validation: Use zod for schema-based validation with react-hook-form via @hookform/resolvers.

5. State Management:
* Local State: Use React's useState and useReducer hooks for component-level state.
* Shared/Global State: For state shared across multiple components, use the React Context API.
* Complex Global State: If your application's state becomes significantly complex, discuss the possible introduction of a dedicated state management library (e.g., Zustand, Jotai) before implementation.

6. Routing:
* Use the Next.js Application Router (filesystem-based routing in the `src/app/` directory).

7. API Calls and Data Fetching:
* Client-Side: Use the native `fetch` API or a simple wrapper around it.
* Server-Side (Next.js): Use Next.js Route Handlers (in `src/app/api/`) or Server Actions for server-side logic and data fetching.

8. Animations:
* Use the `tailwindcss-animate` plugin and the animation utilities provided by Radix UI Components.

9. Notifications/Toasts:
* Use the `Sonner` component (from `src/components/ui/sonner.tsx`) for all toast notifications.

10. Charts and Data Visualization:
* Use `recharts` and its associated components (e.g., `src/components/ui/chart.tsx`) to display charts.

11. Utility Functions:
* General-purpose helper functions should be placed in `src/lib/utils.ts`.
* Ensure functions are well-typed and serve a clear, reusable purpose.

12. Custom Hooks:
* Custom React hooks should be placed in the `src/hooks/` directory (e.g., `src/hooks/use-mobile.tsx`).

13. TypeScript:
* Write all new code in TypeScript.
* Aim for strong typing and take advantage of TypeScript features to improve code quality and maintainability. Avoid using `any` whenever possible.

14. The app must function in a real-world environment, not simulated or with placeholders. If placeholders are needed, the user must be notified.

By following these guidelines, we can build a more robust, maintainable, and consistent application.
# Refactor Plan: Frontend-2 UI/UX Overhaul

## 1. Analysis
*   **Framework**: Vite + React (detected via `package.json`).
*   **Current Styling**: Tailwind CSS v4 is installed (`^4.1.13`), but `index.css` contains a mix of Tailwind directives and extensive custom CSS.
*   **Missing Dependencies**: `lucide-react`, `clsx`, `tailwind-merge`.
*   **Design System**: "Fixture Design System" (OKLCH colors, shadcn/ui patterns, Plus Jakarta Sans font).

## 2. Strategy
We will replace the custom CSS in `index.css` with a clean Tailwind v4 configuration using CSS variables for the OKLCH color system. We will then incrementally refactor components to use these new utility classes and the `cn()` helper.

## 3. Execution Steps

### Step A: Configuration & Foundation
1.  **Install Dependencies**:
    ```bash
    npm install lucide-react clsx tailwind-merge
    ```
2.  **Setup Utils**:
    *   Create `src/lib/utils.js` for the `cn` utility (standard shadcn pattern).
3.  **Global Styles (`src/index.css`)**:
    *   Clear existing custom CSS.
    *   Add `@import "tailwindcss";`.
    *   Define `@theme` block with OKLCH colors, border radius, and font family.
    *   Add `@layer base` for root variables (OKLCH values) and global resets.
    *   Import "Plus Jakarta Sans" from Google Fonts.

### Step B: Component Refactor
Refactor the following components to match the "Fixture" design:
*   **`src/components/Navbar.jsx`**:
    *   Use `sticky top-0 z-50`.
    *   Implement "Glassmorphism" background (`bg-background/95 backdrop-blur`).
    *   Use `lucide-react` icons.
*   **`src/components/Sidebar.jsx`**:
    *   Update to use the new `sidebar` color tokens.
    *   Implement the collapsible pattern if applicable.
*   **`src/components/VideoCard.jsx`**:
    *   Apply the "Technical Grid Background" overlay pattern.
    *   Use `rounded-xl` and `hover:shadow-xl`.
*   **`src/components/CommentBox.jsx`**:
    *   Style inputs and buttons using the new tokens.

### Step C: Page Refactor
*   **`src/pages/Home.jsx`**:
    *   Ensure the "Technical Grid Background" is present.
    *   Update grid layouts to `grid-cols-1 sm:grid-cols-2 lg:grid-cols-3`.
*   **`src/pages/Login.jsx` & `Register.jsx`**:
    *   Center the form with the new "Card" styling.
    *   Use the "Brand Gradient" for primary buttons.

### Step D: Verification
*   Launch `npm run dev`.
*   Verify the "Technical Grid Background" and OKLCH colors in the browser.
*   Take a screenshot.

## 4. Approval
Waiting for user approval to proceed with these steps.

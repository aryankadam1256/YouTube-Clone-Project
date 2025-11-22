# Fixture Platform - Complete Design System Documentation

This document contains the complete design system, styling patterns, UI/UX conventions, and component architecture used in the Fixture Platform. Use this as a reference when building new projects to maintain consistency.

---

## 📦 **TECHNOLOGY STACK**

### Core Framework & Styling
- **Framework**: Next.js 15.4.6 (App Router)
- **Styling**: TailwindCSS v4.1.11 (with PostCSS)
- **Component Library**: shadcn/ui (New York style)
- **Animation**: Framer Motion 12.23.12
- **Icons**: Lucide React 0.539.0
- **Font**: Plus Jakarta Sans (Google Fonts)
- **Color System**: OKLCH color space
- **Utility Functions**: 
  - `clsx` + `tailwind-merge` (via `cn()` utility)
  - `class-variance-authority` (CVA) for component variants

### Key Dependencies
```json
{
  "tailwindcss": "^4.1.11",
  "@tailwindcss/postcss": "^4.1.11",
  "framer-motion": "^12.23.12",
  "lucide-react": "^0.539.0",
  "class-variance-authority": "^0.7.1",
  "clsx": "^2.1.1",
  "tailwind-merge": "^3.3.1",
  "next-themes": "^0.4.6",
  "sonner": "^2.0.7"
}
```

---

## 🎨 **COLOR SYSTEM (OKLCH)**

### Light Theme Colors
```css
:root {
  --radius: 0.625rem; /* 10px base border radius */
  
  /* Core Colors */
  --background: oklch(1 0 0);                    /* Pure white */
  --foreground: oklch(0.145 0 0);               /* Near black */
  --card: oklch(1 0 0);                          /* White */
  --card-foreground: oklch(0.145 0 0);          /* Near black */
  --popover: oklch(1 0 0);                       /* White */
  --popover-foreground: oklch(0.145 0 0);      /* Near black */
  
  /* Primary Colors */
  --primary: oklch(0.205 0 0);                  /* Dark gray/black */
  --primary-foreground: oklch(0.985 0 0);        /* Off-white */
  
  /* Secondary Colors */
  --secondary: oklch(0.97 0 0);                 /* Light gray */
  --secondary-foreground: oklch(0.205 0 0);     /* Dark gray */
  
  /* Muted Colors */
  --muted: oklch(0.97 0 0);                     /* Light gray */
  --muted-foreground: oklch(0.556 0 0);         /* Medium gray */
  
  /* Accent Colors */
  --accent: oklch(0.97 0 0);                    /* Light gray */
  --accent-foreground: oklch(0.205 0 0);        /* Dark gray */
  
  /* Destructive (Error) */
  --destructive: oklch(0.577 0.245 27.325);     /* Red-orange */
  
  /* Borders & Inputs */
  --border: oklch(0.922 0 0);                   /* Light gray border */
  --input: oklch(0.922 0 0);                    /* Light gray input */
  --ring: oklch(0.708 0 0);                     /* Medium gray focus ring */
  
  /* Chart Colors */
  --chart-1: oklch(0.646 0.222 41.116);         /* Orange */
  --chart-2: oklch(0.6 0.118 184.704);          /* Blue */
  --chart-3: oklch(0.398 0.07 227.392);         /* Purple */
  --chart-4: oklch(0.828 0.189 84.429);         /* Yellow */
  --chart-5: oklch(0.769 0.188 70.08);          /* Green */
  
  /* Sidebar Colors */
  --sidebar: oklch(0.985 0 0);                  /* Off-white */
  --sidebar-foreground: oklch(0.145 0 0);       /* Near black */
  --sidebar-primary: oklch(0.205 0 0);          /* Dark gray */
  --sidebar-primary-foreground: oklch(0.985 0 0); /* Off-white */
  --sidebar-accent: oklch(0.97 0 0);            /* Light gray */
  --sidebar-accent-foreground: oklch(0.205 0 0); /* Dark gray */
  --sidebar-border: oklch(0.922 0 0);           /* Light gray */
  --sidebar-ring: oklch(0.708 0 0);             /* Medium gray */
}
```

### Dark Theme Colors
```css
.dark {
  --background: oklch(0.145 0 0);               /* Near black */
  --foreground: oklch(0.985 0 0);               /* Off-white */
  --card: oklch(0.205 0 0);                     /* Dark gray */
  --card-foreground: oklch(0.985 0 0);          /* Off-white */
  --popover: oklch(0.205 0 0);                  /* Dark gray */
  --popover-foreground: oklch(0.985 0 0);       /* Off-white */
  --primary: oklch(0.922 0 0);                  /* Light gray */
  --primary-foreground: oklch(0.205 0 0);       /* Dark gray */
  --secondary: oklch(0.269 0 0);                /* Medium dark gray */
  --secondary-foreground: oklch(0.985 0 0);     /* Off-white */
  --muted: oklch(0.269 0 0);                    /* Medium dark gray */
  --muted-foreground: oklch(0.708 0 0);         /* Light gray */
  --accent: oklch(0.269 0 0);                   /* Medium dark gray */
  --accent-foreground: oklch(0.985 0 0);        /* Off-white */
  --destructive: oklch(0.704 0.191 22.216);     /* Red */
  --border: oklch(1 0 0 / 10%);                 /* White 10% opacity */
  --input: oklch(1 0 0 / 15%);                  /* White 15% opacity */
  --ring: oklch(0.556 0 0);                     /* Medium gray */
  --sidebar: oklch(0.205 0 0);                  /* Dark gray */
  --sidebar-foreground: oklch(0.985 0 0);       /* Off-white */
  --sidebar-primary: oklch(0.488 0.243 264.376); /* Purple */
  --sidebar-primary-foreground: oklch(0.985 0 0); /* Off-white */
  --sidebar-accent: oklch(0.269 0 0);           /* Medium dark gray */
  --sidebar-accent-foreground: oklch(0.985 0 0); /* Off-white */
  --sidebar-border: oklch(1 0 0 / 10%);         /* White 10% opacity */
  --sidebar-ring: oklch(0.556 0 0);             /* Medium gray */
}
```

### Border Radius System
```css
--radius-sm: calc(var(--radius) - 4px);   /* 6px */
--radius-md: calc(var(--radius) - 2px);   /* 8px */
--radius-lg: var(--radius);                /* 10px */
--radius-xl: calc(var(--radius) + 4px);   /* 14px */
```

### Brand Gradient Colors
- **Primary Gradient**: `from-blue-600 via-blue-700 to-orange-600`
- **Background Gradient**: `from-slate-50 via-blue-50/30 to-orange-50/20`
- **Subtle Gradient**: `from-blue-500/20 via-transparent to-orange-500/20`

---

## 📐 **SPACING & SIZING SYSTEM**

### Responsive Breakpoints
- **Mobile**: `< 768px` (use `useIsMobile()` hook)
- **Tablet**: `sm: 640px`, `md: 768px`
- **Desktop**: `lg: 1024px`, `xl: 1280px`, `2xl: 1536px`, `3xl: 1920px`

### Common Spacing Patterns
```tsx
// Container Padding
"px-3 sm:px-4 lg:px-8"        // Horizontal padding (mobile → desktop)
"py-6 sm:py-8"                 // Vertical padding
"px-5 sm:px-6"                 // Hero section padding
"px-4 sm:px-6"                 // Standard container padding

// Gaps
"gap-2 md:gap-4"               // Small gaps (buttons, nav items)
"gap-4 sm:gap-6"               // Medium gaps (cards, sections)
"gap-6 lg:gap-8"               // Large gaps (major sections)
"gap-8 lg:gap-12"              // Extra large gaps (hero sections)

// Component Spacing
"space-y-4 md:space-y-6"       // Vertical spacing between children
"space-y-6 lg:space-y-8"       // Larger vertical spacing
```

### Component Sizing
```tsx
// Buttons
"h-8"                          // Small button (32px)
"h-9"                          // Default button (36px)
"h-10"                         // Large button (40px)
"px-3 py-2"                    // Small padding
"px-4 py-2"                    // Default padding
"px-6 py-3.5"                  // Large padding

// Cards
"rounded-lg"                   // Standard card (8px)
"rounded-xl"                    // Large card (12px)
"rounded-2xl"                   // Extra large card (16px)
"p-4 sm:p-5"                    // Card padding
"p-6"                          // Large card padding
"p-6 sm:p-8 md:p-12"           // Hero card padding

// Inputs
"h-9"                          // Standard input height
"px-3 py-1"                    // Input padding
"rounded-md"                    // Input border radius
```

---

## 🔤 **TYPOGRAPHY**

### Font Family
- **Primary**: Plus Jakarta Sans (Google Fonts)
- **Variable**: `--font-plus-jakarta-sans`
- **Usage**: Applied globally via `fontSans.variable` in root layout

### Font Sizes & Weights
```tsx
// Headings
"text-[28px] sm:text-4xl md:text-5xl lg:text-6xl"  // Hero H1
"text-2xl sm:text-3xl md:text-4xl"                   // Section H1
"text-xl sm:text-2xl"                                 // Subsection H2
"text-lg sm:text-xl"                                  // H3

// Body Text
"text-sm sm:text-base lg:text-lg"                    // Large body
"text-sm sm:text-base"                                // Standard body
"text-xs sm:text-sm"                                  // Small text
"text-xs"                                             // Tiny text

// Font Weights
"font-light"          // 300 - Hero headings
"font-normal"         // 400 - Body text
"font-medium"         // 500 - Emphasis
"font-semibold"       // 600 - Headings, labels
"font-bold"           // 700 - Strong emphasis

// Line Heights & Tracking
"leading-tight"       // 1.25
"leading-relaxed"     // 1.625
"tracking-tight"      // -0.025em
```

### Text Colors
```tsx
"text-foreground"              // Primary text
"text-muted-foreground"        // Secondary text
"text-slate-900"               // Dark text (light mode)
"text-slate-600"               // Medium text
"text-gray-500"                // Muted text
"bg-gradient-to-r from-blue-600 via-blue-700 to-orange-600 bg-clip-text text-transparent" // Gradient text
```

---

## 🧩 **COMPONENT PATTERNS**

### Component Architecture
All UI components follow the **shadcn/ui** pattern with:
- **Radix UI** primitives for accessibility
- **Class Variance Authority (CVA)** for variants
- **`cn()` utility** for className merging
- **`data-slot` attributes** for component identification

### Button Component Pattern
```tsx
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-all disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg:not([class*='size-'])]:size-4 shrink-0 [&_svg]:shrink-0 outline-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px]",
  {
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground shadow-xs hover:bg-primary/90",
        destructive: "bg-destructive text-white shadow-xs hover:bg-destructive/90",
        outline: "border bg-background shadow-xs hover:bg-accent hover:text-accent-foreground",
        secondary: "bg-secondary text-secondary-foreground shadow-xs hover:bg-secondary/80",
        ghost: "hover:bg-accent hover:text-accent-foreground",
        link: "text-primary underline-offset-4 hover:underline",
      },
      size: {
        default: "h-9 px-4 py-2 has-[>svg]:px-3",
        sm: "h-8 rounded-md gap-1.5 px-3 has-[>svg]:px-2.5",
        lg: "h-10 rounded-md px-6 has-[>svg]:px-4",
        icon: "size-9",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
);
```

### Card Component Pattern
```tsx
// Base Card
<div className="bg-card text-card-foreground flex flex-col gap-6 rounded-xl border py-6 shadow-sm">

// Card Header
<div className="@container/card-header grid auto-rows-min grid-rows-[auto_auto] items-start gap-1.5 px-6 has-data-[slot=card-action]:grid-cols-[1fr_auto] [.border-b]:pb-6">

// Card Content
<div className="px-6">

// Card Footer
<div className="flex items-center px-6 [.border-t]:pt-6">
```

### Input Component Pattern
```tsx
<input
  className="file:text-foreground placeholder:text-muted-foreground selection:bg-primary selection:text-primary-foreground dark:bg-input/30 border-input flex h-9 w-full min-w-0 rounded-md border bg-transparent px-3 py-1 text-base shadow-xs transition-[color,box-shadow] outline-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive"
/>
```

### Dialog/Modal Pattern
```tsx
// Overlay
<div className="data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 fixed inset-0 z-50 bg-black/50">

// Content
<div className="bg-background data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 fixed top-[50%] left-[50%] z-50 grid w-full max-w-[calc(100%-2rem)] translate-x-[-50%] translate-y-[-50%] gap-4 rounded-lg border p-6 shadow-lg duration-200 sm:max-w-lg">
```

---

## 🎬 **ANIMATION SYSTEM**

### Framer Motion Patterns

#### Basic Animation Variants
```tsx
// Fade In
const fadeIn = {
  hidden: { opacity: 0 },
  visible: { opacity: 1 },
};

// Fade In Up (most common)
const fadeInUp = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 },
};

// Scale In
const scaleIn = {
  hidden: { opacity: 0, scale: 0.8 },
  visible: { opacity: 1, scale: 1 },
};

// Stagger Container
const staggerContainer = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.1,
    },
  },
};
```

#### Common Transitions
```tsx
// Standard transition
transition={{ duration: 0.6, ease: [0.4, 0, 0.2, 1] }}

// Fast transition
transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}

// Spring transition
transition={{ type: "spring", stiffness: 300, damping: 30 }}
```

#### Pre-built Animated Components
```tsx
import { FadeIn, FadeInUp, StaggerContainer, StaggerItem } from "@/lib/animations";

// Usage
<StaggerContainer>
  <StaggerItem>
    <Card>Content 1</Card>
  </StaggerItem>
  <StaggerItem>
    <Card>Content 2</Card>
  </StaggerItem>
</StaggerContainer>
```

#### Hero Section Animation Pattern
```tsx
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.2,
      delayChildren: 0.1,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
  },
};

<motion.div
  variants={containerVariants}
  initial="hidden"
  animate="visible"
>
  <motion.h1 variants={itemVariants}>Title</motion.h1>
  <motion.p variants={itemVariants}>Description</motion.p>
</motion.div>
```

---

## 📱 **LAYOUT PATTERNS**

### Container Wrapper
```tsx
// Standard container
<div className="container mx-auto px-4 sm:px-6">

// Max width container
<div className="mx-auto px-3 sm:px-4 py-6 sm:py-8 min-h-screen max-w-7xl">

// Full width with padding
<div className="w-full px-5 sm:px-6">
```

### Grid Layouts
```tsx
// Two column (content + sidebar)
<div className="grid grid-cols-1 lg:grid-cols-[1fr_300px] gap-4 sm:gap-6">

// Three column
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">

// Five column (hero split)
<div className="grid lg:grid-cols-5 h-full items-center gap-8 lg:gap-12">
  <div className="lg:col-span-3">Content</div>
  <div className="lg:col-span-2">Sidebar</div>
</div>
```

### Flexbox Patterns
```tsx
// Centered content
<div className="flex items-center justify-center">

// Space between
<div className="flex justify-between items-center gap-2 md:gap-4">

// Column layout
<div className="flex flex-col gap-4 md:gap-6">

// Responsive flex direction
<div className="flex flex-col sm:flex-row gap-3 sm:gap-4 items-stretch sm:items-center">
```

### Sticky Header Pattern
```tsx
<header className="border-grid sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
  <div className="container-wrapper 3xl:fixed:px-0 px-6">
    <div className="flex h-14 justify-between items-center gap-2 md:gap-4">
      {/* Navigation content */}
    </div>
  </div>
</header>
```

---

## 🎨 **VISUAL PATTERNS**

### Background Patterns

#### Technical Grid Background
```tsx
<div className="absolute inset-0 opacity-[0.02] md:opacity-[0.03]">
  <div
    className="w-full h-full"
    style={{
      backgroundImage: `
        linear-gradient(rgba(30, 64, 175, 0.8) 1px, transparent 1px),
        linear-gradient(90deg, rgba(30, 64, 175, 0.8) 1px, transparent 1px),
        linear-gradient(rgba(194, 65, 12, 0.4) 2px, transparent 2px),
        linear-gradient(90deg, rgba(194, 65, 12, 0.4) 2px, transparent 2px)
      `,
      backgroundSize: "20px 20px, 20px 20px, 100px 100px, 100px 100px",
    }}
  />
</div>
```

#### Blueprint Dots Overlay
```tsx
<div
  className="absolute inset-0 opacity-[0.04] md:opacity-[0.08]"
  style={{
    backgroundImage: "radial-gradient(circle, rgb(30, 64, 175) 1px, transparent 1px)",
    backgroundSize: "30px 30px",
  }}
/>
```

#### Gradient Backgrounds
```tsx
// Hero gradient
className="bg-gradient-to-br from-slate-50 via-blue-50/30 to-orange-50/20"

// Subtle overlay gradient
className="bg-gradient-to-br from-blue-500/20 via-transparent to-orange-500/20 opacity-5"
```

### Shadow System
```tsx
"shadow-xs"        // Subtle shadow (buttons, inputs)
"shadow-sm"         // Small shadow (cards)
"shadow-lg"         // Large shadow (modals, elevated cards)
"shadow-xl"         // Extra large shadow (hover states)
"shadow-2xl"        // Maximum shadow (hero cards)
```

### Border Patterns
```tsx
"border"                           // Standard border
"border-b"                         // Bottom border
"border-t"                         // Top border
"border-gray-300"                  // Light gray border
"border-slate-300"                 // Slate border
"border-input"                     // Input border color
"rounded-md"                       // 6px radius
"rounded-lg"                       // 8px radius
"rounded-xl"                       // 12px radius
"rounded-2xl"                      // 16px radius
"rounded-full"                     // Full circle (buttons, badges)
```

---

## 🎯 **UI/UX PATTERNS**

### Hover States
```tsx
// Button hover
"hover:bg-primary/90 hover:scale-[1.02]"

// Card hover
"hover:shadow-xl transition-all duration-200"

// Link hover
"hover:text-blue-700 hover:underline"

// Icon hover
"group-hover:translate-x-1 transition-transform"
```

### Focus States
```tsx
// Standard focus ring
"focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px]"

// Destructive focus
"focus-visible:ring-destructive/20 dark:focus-visible:ring-destructive/40"
```

### Loading States
```tsx
// Skeleton loader
<div className="bg-accent animate-pulse rounded-md">

// Spinner
<div className="w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
```

### Disabled States
```tsx
"disabled:pointer-events-none disabled:opacity-50 disabled:cursor-not-allowed"
```

### Scrollbar Hiding
```css
/* Global scrollbar hide */
body {
  overflow: -moz-scrollbars-none;
  -ms-overflow-style: none;
  scrollbar-width: none;
}

html::-webkit-scrollbar,
body::-webkit-scrollbar {
  display: none;
}

/* Utility class */
.scrollbar-hide::-webkit-scrollbar {
  display: none;
}
```

---

## 📋 **FORM PATTERNS**

### Form Layout
```tsx
<form className="space-y-6">
  <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
    <div className="lg:col-span-2">
      {/* Main form field */}
    </div>
    <div>
      {/* Sidebar field */}
    </div>
  </div>
</form>
```

### Form Field with Icon
```tsx
<div className="flex items-center gap-3 mb-4">
  <div className="inline-flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-br from-blue-100 to-indigo-100">
    <Icon className="w-5 h-5 text-blue-600" />
  </div>
  <div>
    <Label className="text-lg font-semibold text-slate-900">
      Field Label
    </Label>
    <p className="text-sm text-gray-500">
      Helper text
    </p>
  </div>
</div>
```

---

## 🎴 **CARD PATTERNS**

### Standard Card
```tsx
<div className="group relative rounded-lg border border-gray-300 p-4 sm:p-5 transition-all duration-200 bg-white hover:shadow-xl cursor-pointer overflow-hidden">
  {/* Grid background overlay */}
  <div className="absolute inset-0 opacity-[0.02] md:opacity-[0.03]">
    {/* Grid pattern */}
  </div>
  
  {/* Content */}
  <div className="relative z-10">
    {/* Card content */}
  </div>
</div>
```

### Card with Icon Badge
```tsx
<div className="flex items-center gap-3 sm:gap-4 flex-1 min-w-0">
  <div className="bg-gradient-to-br from-blue-100 to-blue-50 rounded-lg p-2.5 sm:p-3 flex-shrink-0">
    <Icon className="w-5 h-5 sm:w-6 sm:h-6 text-blue-600" />
  </div>
  <div className="flex-1 min-w-0">
    <h3 className="font-semibold text-gray-900 text-base sm:text-lg mb-0.5">
      Title
    </h3>
    <p className="text-sm sm:text-base text-gray-600 line-clamp-1">
      Description
    </p>
  </div>
</div>
```

---

## 🔧 **UTILITY FUNCTIONS**

### `cn()` - Class Name Merger
```tsx
import { cn } from "@/lib/utils";

// Usage
<div className={cn("base-classes", condition && "conditional-classes", className)}>
```

### `useIsMobile()` Hook
```tsx
import { useIsMobile } from "@/hooks/use-mobile";

const isMobile = useIsMobile(); // Returns boolean, breakpoint: 768px
```

---

## 🎭 **COMMON COMPONENT TEMPLATES**

### Hero Section Template
```tsx
<section className="relative h-[90vh] bg-gradient-to-br from-slate-50 via-blue-50/30 to-orange-50/20 overflow-hidden flex items-center">
  {/* Background overlays */}
  <div className="absolute inset-0 opacity-[0.02] md:opacity-[0.03]">
    {/* Grid pattern */}
  </div>
  
  <div className="relative z-10 container mx-auto px-5 sm:px-6 w-full h-full">
    <div className="grid lg:grid-cols-5 h-full items-center gap-8 lg:gap-12">
      <motion.div
        className="lg:col-span-3 space-y-6 lg:space-y-8 text-center lg:text-left"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        <motion.h1
          className="text-[28px] sm:text-4xl md:text-5xl lg:text-6xl font-light tracking-tight leading-tight"
          variants={itemVariants}
        >
          Title
        </motion.h1>
        {/* CTA buttons */}
      </motion.div>
    </div>
  </div>
</section>
```

### Page Layout Template
```tsx
<div className="mx-auto px-3 sm:px-4 py-6 sm:py-8 min-h-screen max-w-7xl">
  <div className="grid grid-cols-1 lg:grid-cols-[1fr_300px] gap-4 sm:gap-6">
    <div className="min-w-0 px-0 sm:px-4 lg:px-8">
      {/* Main content */}
    </div>
    <div className="hidden lg:block space-y-4">
      {/* Sidebar */}
    </div>
  </div>
</div>
```

### Modal/Dialog Template
```tsx
<Dialog>
  <DialogTrigger>Open</DialogTrigger>
  <DialogContent>
    <DialogHeader>
      <DialogTitle>Title</DialogTitle>
      <DialogDescription>Description</DialogDescription>
    </DialogHeader>
    {/* Content */}
    <DialogFooter>
      <Button variant="outline">Cancel</Button>
      <Button>Confirm</Button>
    </DialogFooter>
  </DialogContent>
</Dialog>
```

---

## 📦 **COMPONENT LIBRARY STRUCTURE**

### shadcn/ui Components Used
- `button`, `card`, `input`, `label`, `textarea`
- `dialog`, `sheet`, `drawer`, `popover`
- `dropdown-menu`, `select`, `checkbox`, `switch`
- `tabs`, `accordion`, `collapsible`
- `table`, `pagination`, `skeleton`
- `badge`, `avatar`, `tooltip`, `alert`
- `sidebar`, `scroll-area`, `separator`
- `calendar`, `slider`, `progress`
- `sonner` (toast notifications)

### Custom Components
- Animation wrappers (`FadeIn`, `StaggerItem`, etc.)
- Page transition loader
- Custom form components
- Dashboard-specific cards
- Navigation components

---

## 🎨 **DESIGN TOKENS SUMMARY**

### Spacing Scale
- `0.5` = 2px, `1` = 4px, `2` = 8px, `3` = 12px, `4` = 16px
- `5` = 20px, `6` = 24px, `8` = 32px, `10` = 40px, `12` = 48px

### Border Radius
- `sm`: 6px, `md`: 8px, `lg`: 10px, `xl`: 12px, `2xl`: 16px

### Shadows
- `xs`: Subtle, `sm`: Small, `md`: Medium, `lg`: Large, `xl`: Extra large, `2xl`: Maximum

### Z-Index Scale
- `0`: Base, `10`: Elevated, `20`: Dropdown, `30`: Sticky, `40`: Overlay, `50`: Modal

---

## 🚀 **PERFORMANCE OPTIMIZATIONS**

### Code Splitting
```tsx
// Dynamic imports for heavy components
const HeavyComponent = dynamic(() => import("./HeavyComponent"), {
  ssr: true,
  loading: () => <Skeleton />,
});
```

### Image Optimization
- Next.js Image component with optimized loading
- Responsive image sizes
- Lazy loading for below-fold content

### Animation Performance
- Use `transform` and `opacity` for animations (GPU accelerated)
- Avoid animating `width`, `height`, `top`, `left`
- Use `will-change` sparingly

---

## 📝 **ACCESSIBILITY PATTERNS**

### Focus Management
- Visible focus rings on all interactive elements
- Keyboard navigation support
- ARIA labels where needed

### Semantic HTML
- Proper heading hierarchy (h1 → h2 → h3)
- Form labels associated with inputs
- Button vs. link distinction

### Color Contrast
- All text meets WCAG AA standards
- Focus indicators are clearly visible
- Error states use color + icon + text

---

## 🔄 **STATE MANAGEMENT PATTERNS**

### Client Components
- Use `"use client"` directive for interactivity
- React hooks for local state
- Zustand for global state (if needed)

### Server Components
- Default to server components
- Fetch data directly in components
- Pass data as props to client components

---

## 📚 **FILE STRUCTURE CONVENTIONS**

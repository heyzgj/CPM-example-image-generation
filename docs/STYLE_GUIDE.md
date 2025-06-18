# UI / Brand Style Guide

## 1. Color Palette

```javascript
// tailwind.config.js
module.exports = {
  theme: {
    extend: {
      colors: {
        primary: "#2563EB",   // Blue-600
        secondary: "#475569", // Slate-600
        accent: "#F97316",    // Orange-500
        bg: "#F9FAFB",        // Light grey background
        surface: "#FFFFFF",   // Cards and panels
      },
    },
  },
}
````

## 2. Typography

| Element | Tailwind Classes          | Usage               |
| ------- | ------------------------- | ------------------- |
| h1      | `text-4xl font-extrabold` | Page titles         |
| h2      | `text-3xl font-semibold`  | Section headings    |
| h3      | `text-xl font-medium`     | Panel headings      |
| body    | `text-base font-normal`   | Paragraphs          |
| small   | `text-sm font-light`      | Footnotes, captions |

Font family for all text: `Inter, sans-serif`.

## 3. Component Guidelines

* **Button**

  * Default: rounded-lg, px-6 py-2, shadow-sm
  * States: hover (scale-105), active (opacity-80)

* **Card**

  * Use `Card`, `CardHeader`, `CardContent`, `CardFooter` from shadcn/ui
  * Rounded corners (2xl), soft shadow, padding p-4

* **Input**

  * Use `Input` from shadcn/ui
  * Focus-visible: ring-2 ring-offset-2 ring-primary

## 4. Spacing & Radius Tokens

| Token         | Value     | Usage                  |
| ------------- | --------- | ---------------------- |
| `--space-4`   | `1rem`    | Base grid spacing      |
| `--space-8`   | `2rem`    | Section margins        |
| `--radius-lg` | `0.75rem` | Buttons & cards radius |

## 5. Accessibility

* Contrast ratio ≥ 4.5:1 for text vs. background.
* All interactive elements must have `:focus-visible` outlines.
* Provide `alt` text for all images.
* Ensure full keyboard navigation.
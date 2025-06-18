
# Technical Specification

## 1. System Architecture

```mermaid
graph TD
  Browser[User Browser] -- HTTPS --> CDN[CDN (e.g. Vercel)]
  CDN -- Serves Next.js App --> Browser
  Browser -- REST/GraphQL --> Serverless[Serverless Functions]
  Serverless -- Call Gemini API --> Gemini[Gemini Flash-Preview Service]
  Browser -- IndexedDB --> DB[IndexedDB (Projects & Keys)]
```

## 2. Tech Stack

```yaml
frontend:
  framework: nextjs@14.x
  styling: tailwindcss@^3, shadcn/ui
  state: react-query, zustand
  storage: IndexedDB (idb library)
backend:
  hosting: Vercel Serverless Functions
  runtime: nodejs@18
  dependencies:
    - axios (API calls)
    - webcrypto-shim (key encryption)
APIs:
  - Gemini 2.0 Flash Preview Image Generation (user-provided key)
```

## 3. Data Models (Zod Schemas)

// src/lib/schema.ts

```typescript
import { z } from "zod"

export const UserKey = z.object({
  id: z.string().uuid().describe("Local PK"),
  apiKey: z.string().min(32).describe("Gemini API key encrypted"),
  createdAt: z.date().default(() => new Date()),
})

export const Style = z.object({
  id: z.string().uuid(),
  name: z.string(),
  thumbnailUrl: z.string().url(),
})

export const Transformation = z.object({
  id: z.string().uuid(),
  styleId: z.string().uuid(),
  originalImageUrl: z.string().url(),
  styledImageUrl: z.string().url(),
  createdAt: z.date().default(() => new Date()),
})
```

## 4. API Contracts

### Client → Serverless

* **POST** `/api/transform`

  * **Body:** `{ image: base64, styleId: string }`
  * **Response:** `200 OK` `{ transformationId: string, styledImageUrl: string }`

* **GET** `/api/styles`

  * **Response:** `200 OK` `Style[]`

### Serverless → Gemini

* **POST** `https://api.gemini.ai/v2/flash-preview`

  * **Headers:** `Authorization: Bearer <userKey>`
  * **Body:** `{ image, stylePreset }`

## 5. Deployment & CI/CD

* **Environment Variables:** none (all keys user-provided).
* **Build Steps:**

  1. `npm ci`
  2. `npm run lint`
  3. `npm run build`
  4. `npm run export`
* **CD:** Push to `main` → Vercel auto-deploy.
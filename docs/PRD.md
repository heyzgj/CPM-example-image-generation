```markdown filename: PRD.md
# Product Requirements Document (PRD)

## 1. Executive Summary
Deliver a web‑only application that leverages Google’s Gemini 2.0 Flash Preview model (`gemini-2.0-flash-preview-image-generation`) to provide on‑demand, high‑quality artistic style transformations of user‑uploaded images in under 5 seconds per image. Users select from a curated library of preset art styles. The app is free to use; users supply their own Gemini API key.

## 2. Problem Statement
Designers, social‑media creators, and casual users currently rely on manual, multi‑step photo editing workflows (e.g., Adobe Photoshop) or single‑purpose mobile apps (e.g., Prisma) with limited style sets and slow processing times. There is no unified web solution combining extensive preset style variety, sub‑5‑second turnaround, and a bring‑your‑own‑API‑key model.

## 3. Core Features & User Stories
### 3.1 Image Upload
- **As a** user  
- **I want to** upload a single JPEG or PNG image (max 10 MB)  
- **So that** I can apply an AI style transformation

| Given                       | When                         | Then                                                                              |
|-----------------------------|------------------------------|-----------------------------------------------------------------------------------|
| A user is on the `/upload` page | They drag‑and‑drop or browse | The image is validated (format, size) and previewed for processing                |

### 3.2 Style Selection
- **As a** user  
- **I want to** choose from a curated library of preset art styles  
- **So that** I can control the creative output

| Given                        | When                     | Then                                                             |
|------------------------------|--------------------------|------------------------------------------------------------------|
| A user has uploaded a source image | They click a preset style | The chosen style is previewed alongside the source               |

### 3.3 AI Transformation
- **As a** user  
- **I want to** trigger the transformation with one click  
- **So that** I get my styled image quickly

| Given                             | When                | Then                                                        |
|-----------------------------------|---------------------|-------------------------------------------------------------|
| A user confirms a preset style    | They press “Transform” | The app calls `gemini-2.0-flash-preview-image-generation` and returns the styled image within 5 s |

### 3.4 Preview & Download
- **As a** user  
- **I want to** see a side‑by‑side before/after preview  
- **So that** I can decide to download or re‑style

| Given                    | When                        | Then                                                       |
|--------------------------|-----------------------------|------------------------------------------------------------|
| AI‑generated image ready | It displays next to the source | User can download the output PNG/JPEG or click “Try Again” |

### 3.5 User Accounts & API Key
- **As a** returning user  
- **I want to** save my projects and store my own Gemini API key  
- **So that** I can manage my creative library and authenticate requests

| Given                               | When                     | Then                                                           |
|-------------------------------------|--------------------------|----------------------------------------------------------------|
| A user provides a valid API key     | They save it in settings | The key is securely stored (client‑side) and used for requests |

## 4. Non‑Functional Requirements (NFRs)
- **Performance:** Average end‑to‑end image transformation < 5 s  
- **Accessibility:** Conform to WCAG 2.1 Level AA standards  
- **Security & Privacy:**  
  - Client‑side storage of API keys; no server‑side persistence  
  - All requests made serverless or via user key to Gemini API  
- **Scalability:** Support at least 100 concurrent users  
- **Monitoring:** Track API error rate (< 1 %) and latency metrics  

## 5. Out of Scope
- Custom or user‑uploaded style references  
- Mobile‑native apps  
- Batch or multi‑image processing  
- Paid features or subscription tiers  

## 6. Dependencies and Risks
- **Dependencies:**  
  - `gemini-2.0-flash-preview-image-generation` API (user’s own key)  
  - Web hosting (e.g., Vercel or Netlify)  
  - OAuth 2.0 PKCE scaffold (for key management)  
- **Risks & Mitigations:**  
  - **API Rate Limits:** Advise users to monitor usage; implement client‑side retry logic  
  - **Key Exposure:** Use secure storage APIs (e.g., Web Crypto)  
  - **Cost Escalation on Hosting:** Choose pay‑as‑you‑go services and monitor billing closely  

## 7. Appendix
- Gemini 2.0 Flash Preview docs: https://developers.googleblog.com/en/generate-images-gemini-2-0-flash-preview/  
- Style‑transfer inspiration (Prisma): https://en.wikipedia.org/wiki/Prisma_(app)
```

# User Experience Flows

## 1. Authentication & API Key Setup

```mermaid
flowchart TD
  A[User lands on Home] --> B{Has API Key stored?}
  B -- No --> C[Shows “Enter Gemini API Key” modal]
  C --> D[User pastes key & clicks Save]
  D --> E{Validate Key}
  E -- Success --> F[Persist key client-side & redirect to Upload]
  E -- Failure --> G[Show error; stay on modal]
  B -- Yes --> H[Redirect to Upload page]
```

### Sign-Up / API Key Entry

1. User arrives; prompted to enter their Gemini API key.
2. On valid key, store securely (Web Crypto) and send them to the Upload flow.
3. On invalid key, display inline error and retry option.

## 2. Image Upload & Style Selection

```mermaid
flowchart LR
  U[Upload Page] --> V[Click “Upload Image”]
  V --> W{Validate File}
  W -- OK --> X[Show image preview + style gallery]
  W -- Fail --> Y[Show file-type or size error]
  X --> Z[User selects one preset style]
```

### Upload Flow

* **Entry:** User clicks “Upload Image.”
* **Validation:** Client checks type (JPEG/PNG) & size (<10 MB).
* **Preview:** Display uploaded image thumbnail.
* **Error:** On fail, show contextual message (“Unsupported format,” “File too large”).

### Style Selection

* Display a horizontal gallery of preset thumbnails (e.g., “Van Gogh,” “Watercolor,” “Neo-Tokyo”).
* On hover, show style name; on click, highlight selection.

## 3. Transformation & Result

```mermaid
flowchart TD
  Z[Style selected] --> A1[Click “Transform”]
  A1 --> B1[Show loading spinner + progress]
  B1 --> C1{Success/failure}
  C1 -- Success --> D1[Show before/after comparison]
  C1 -- Failure --> E1[Show error & “Try Again”]
```

### Transformation

* **Trigger:** User clicks “Transform.”
* **Call:** Frontend invokes Gemini Flash Preview endpoint with user’s key, image, style.
* **UX:** Show skeleton loader with animated progress indicator up to 5 s.

### Preview & Download

* Display two cards side-by-side: original vs. styled.
* Provide buttons: “Download PNG,” “Download JPEG,” and “Try Again” (resets style picker).

## 4. Settings & History

```mermaid
flowchart TD
  F1[Header “My Projects”] --> G1[List saved projects]
  G1 --> H1[Click project → Reopen Upload & style pre-selected]
  G1 --> I1[Click delete icon → Remove project]
```

### Project History

* After each successful transform, auto-save timestamped entry in “My Projects.”
* Allow users to revisit or delete past transforms.
* Persist metadata (style used, timestamp, download count) client-side (IndexedDB).
# Data Map and Relationships

## Entity-Relationship Diagram

```mermaid
erDiagram
  USER_KEY ||--o{ TRANSFORMATION : "owns"
  STYLE ||--o{ TRANSFORMATION : "applied_to"
```

## Entities

| Entity             | Attributes                                                                  |
| ------------------ | --------------------------------------------------------------------------- |
| **UserKey**        | id (PK), apiKey (encrypted), createdAt                                      |
| **Style**          | id (PK), name, thumbnailUrl                                                 |
| **Transformation** | id (PK), styleId (FK→Style.id), originalImageUrl, styledImageUrl, createdAt |

## Relationships

* **UserKey → Transformation**: One-to-Many
* **Style → Transformation**: One-to-Many

## Business Rules

* When a **Transformation** is deleted, no cascading deletes on **Style** or **UserKey**.
* **Style** is read-only; styles managed in code, not by users.
* **UserKey** may only be created/deleted by the owning user (client).
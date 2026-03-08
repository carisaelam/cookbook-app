# Firebase Setup

This app uses Firebase Auth + Cloud Firestore.

## 1) Create a Firebase project
- Enable **Authentication** with Google provider.
- Enable **Cloud Firestore** in production mode.

## 2) Configure env vars
- Copy `.env.example` to `.env.local`.
- Fill in your Firebase web app values.

## 3) Deploy Firestore rules
- Install Firebase CLI and login.
- Run `firebase init firestore` (if not already configured).
- Use `firebase/firestore.rules` from this repo.
- Deploy with `firebase deploy --only firestore:rules`.

## 4) Add approved editors
Only users in `/editors/{uid}` can write.

- Have each editor sign in once so you can get their UID.
- In Firestore, create document: `editors/<uid>`
- Document can contain any fields, e.g.:

```json
{
  "email": "editor@example.com",
  "created_at": "2026-03-07T00:00:00.000Z"
}
```

Users not in `editors` are read-only.

## 5) Seed all existing recipes/categories
This repo includes a one-time seeder that imports all data from `public/seed.json`.

Prereqs:
- You are logged in to gcloud ADC:
  - `gcloud auth application-default login`
- Your project ID is set:
  - `export FIREBASE_PROJECT_ID=your-project-id`

Run:
- `npm run seed:firestore`

The script upserts:
- all categories into `categories/{id}`
- all recipes into `recipes/{id}`

## Collections used
- `categories`
- `recipes`
- `editors`

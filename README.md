# 🏕️ RIDB Normalizer

**RIDB Normalizer** is an open-source project that fetches, cleans, and normalizes campground and campsite data from the [Recreation Information Database (RIDB)](https://ridb.recreation.gov/).  
The goal is to provide a consistent, developer-friendly data model that can power projects like [Campvue](https://campvue.com) or any other recreation-focused applications.

---

## 🚀 Overview

The official RIDB API is an incredible resource for discovering federal recreation facilities across the U.S., but its data is inconsistent across agencies and sites.  
Boolean fields may appear as strings, text may vary in structure, and records can be incomplete or malformed.

**RIDB Normalizer** provides:
- A robust **TypeScript-based normalization layer** for facilities and campsites.
- A **Next.js API** for serving cleaned data.
- A **Postgres (Supabase) datastore** for caching and reusing normalized results.
- A **Tailwind-styled admin interface** (in progress) for browsing data and testing endpoints.

This project is designed to be:
- ⚙️ **Modular** — You can import the normalization logic independently.
- 💾 **Reliable** — Stores stable, versioned data snapshots for resilience against flaky upstream APIs.
- 🧩 **Extensible** — Add your own cleaning rules, mappers, or enrichment logic (e.g., amenities, geospatial search).

---

## 🧠 Tech Stack

| Layer | Technology                                                   |
|-------|--------------------------------------------------------------|
| **Framework** | [Next.js 16+](https://nextjs.org/) with App Router           |
| **Language** | [TypeScript](https://www.typescriptlang.org/)                |
| **Styling** | [Tailwind CSS](https://tailwindcss.com/)                     |
| **Database** | [Supabase (PostgreSQL)](https://supabase.com/)               |
| **Linting** | [ESLint](https://eslint.org/)                                |
| **Bundler** | [Turbopack](https://turbo.build/pack) (dev) / Webpack (prod) |
| **Hosting** | [Vercel](https://vercel.com/) (for demo/API hosting)         |

---

## 🧰 Features

✅ Fetches campground and campsite data from the official RIDB API  
✅ Normalizes inconsistent field types (booleans, strings, enums, etc.)  
✅ Stores raw + normalized versions in Supabase for auditing  
✅ Provides a clean, versioned REST API for consuming normalized data  
✅ Supports scheduled re-sync (cron job) for upstream changes  
✅ Optional demo UI for previewing cleaned data  
✅ Clean, documented TypeScript code for recruiters and collaborators




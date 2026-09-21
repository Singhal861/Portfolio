# Abhishek Singhal — Data Engineer Portfolio 🚀

![Data Engineering](https://img.shields.io/badge/Role-Data_Engineer-F59E0B?style=for-the-badge)
![Experience](https://img.shields.io/badge/Experience-4+_Years-0B0F1A?style=for-the-badge)
![Status](https://img.shields.io/badge/Status-Available_for_Opportunities-10B981?style=for-the-badge)

Welcome to the repository for my personal portfolio website! This project is a responsive, single-page application built to showcase my professional journey, projects, and achievements in the data engineering space.

## 🌐 Live Website
**👉 [View Portfolio Live](https://singhal861.github.io/Portfolio/)**

## 💡 About Me
I am a results-driven Data Engineer with 4+ years of experience architecting scalable data pipelines and leading large-scale cloud migrations across **Azure** and **GCP**. My expertise spans the full modern data stack, including **PySpark, Databricks, BigQuery, and Power BI**.

Throughout my career at **Deloitte, Infosys**, and **KPMG**, I have focused on converting complex, messy data landscapes into reliable, high-performance systems that create real business value.

## 🛠️ Portfolio Tech Stack
This website was built completely from scratch focusing on modern web design aesthetics.
- **HTML5**: Semantic structure and accessible layouts.
- **Vanilla CSS3**: Custom "Midnight & Amber" design system featuring glassmorphism, responsive grid/flexbox layouts, and scroll-triggered animations.
- **Vanilla JavaScript**: `IntersectionObserver` for scroll animations, dynamic counters, interactive skill bars, and seamless Google Forms integration.
- **Backend**: Serverless form submission handled via Google Forms using `no-cors` fetch API.

## 🏆 Certifications Featured
- Databricks Certified Data Engineer Professional
- Databricks Certified Data Engineer Associate
- Microsoft Certified: Power BI Data Analyst Associate
- Microsoft Certified: Azure Data Fundamentals
- Microsoft Certified: Azure AI Fundamentals

## 📫 Let's Connect
- **LinkedIn**: [abhishek-s-2707b9138](https://www.linkedin.com/in/abhishek-s-2707b9138/)
- **Email**: [abhisheksinghal861@gmail.com](mailto:abhisheksinghal861@gmail.com)

---
*Designed & Built for Abhishek Singhal © 2026*

---

# Japanese Portal

A secure, Sheets-based Next.js app built for the `/Japanese` route and styled to match the portfolio’s “Midnight & Amber” visual palette.

## Features

- Register and login with email + password credentials
- Protected routing under `/Japanese`
- Google Sheets-backed Users and Verbs tabs through Google Apps Script
- Dashboard for each user’s own Japanese verb records
- CSV export for the current user
- Email export to the user using SMTP
- Midnight + Amber theme matching the reference design

## Local development

1. Install dependencies:
   ```bash
   npm install
   ```

2. Copy the example environment file:
   ```bash
   cp .env.example .env.local
   ```

3. Fill in the values in `.env.local`.

4. Run the app:
   ```bash
   npm run dev
   ```

5. Open:
   ```bash
   http://localhost:3000/Japanese
   ```

## Base path note

This app is designed to be mounted under `/Japanese` on the same portfolio domain. For Vercel, either:

- keep the app as a standalone Next.js app and route it under `/Japanese` from the portfolio host, or
- if using a Next.js `basePath`, set it to `/Japanese` and document the same route in the deployment config.

For this project, the route-based structure assumes `/Japanese` is the app root.

## Env vars

See [.env.example](.env.example) for the complete list.

Required values:

- `AUTH_SECRET`
- `GOOGLE_APPS_SCRIPT_URL`
- `GOOGLE_APPS_SCRIPT_SECRET`
- `EMAIL_FROM`
- `SMTP_HOST`
- `SMTP_PORT`
- `SMTP_USER`
- `SMTP_PASS`
- `NEXTAUTH_URL`

## Free Google Sheets setup

1. Create a Google Sheet. Keep its spreadsheet ID from the URL.
2. Open **Extensions > Apps Script** from that sheet.
3. Copy [apps-script/Code.gs](apps-script/Code.gs) into the Apps Script editor.
4. In Apps Script, open **Project Settings > Script properties** and add:
   - `SPREADSHEET_ID`: your Google Sheet ID
   - `APP_SECRET`: a long random secret you create
5. Deploy it with **Deploy > New deployment > Web app**.
6. Set **Execute as** to yourself and **Who has access** to anyone.
7. Copy the deployed `/exec` URL into `GOOGLE_APPS_SCRIPT_URL`.
8. Put the same `APP_SECRET` in `GOOGLE_APPS_SCRIPT_SECRET`.

Header row examples:

Users tab:

```text
id,name,email,passwordHash,createdAt
```

Verbs tab:

```text
S.No,Meaning,Dictionary,~masu,~mashita,~masen,~masen deshita,Short -ve (nai/anai),Past short (ta/da),Past short -ve,~te,~te-iru,~te-imasu,~te-imasu -ve,Stem
```

Each new user starts with the sample row `1, to wait, まつ, まちます, まちました, まちません, まちませんでした, またない, まった, またなかった, まって, まっている, まっています, まっていません, まち`. The ownership columns are kept hidden in the sheet so exports contain only the grammar columns.

This approach does not require a Google Cloud billing account, service account, private key, or trial credit. Apps Script and Google Sheets still have usage quotas, so this is intended for a small personal learning site rather than unlimited high-volume traffic.

## Email configuration

This app uses SMTP by default, which is the simplest free option for most personal projects.

Example Gmail setup:

- `SMTP_HOST=smtp.gmail.com`
- `SMTP_PORT=587`
- `SMTP_USER=your-email@gmail.com`
- `SMTP_PASS=your-app-password`

If you prefer Resend, uncomment and configure the equivalent logic in your deployment environment.

## Data privacy and security

- Passwords are hashed with `bcryptjs` before storage.
- Only the logged-in user can read or export their own rows.
- No plaintext credential values are committed to the repo.
- All secret values must be stored in environment variables only.

## Deploy to Vercel

1. Push this project to GitHub.
2. Import it into Vercel.
3. Add the environment variables from `.env.example`.
4. Set `NEXTAUTH_URL` to the production origin, without `/Japanese`:
   ```text
   https://portfolio-abhishek-singhal.vercel.app
   ```
5. Deploy.

## Branch workflow: keep main updated, then build on top of it

To preserve the original portfolio and keep the latest remote updates safe:

1. Update the local main branch from the remote repository:
   ```bash
   git fetch origin
   git checkout main
   git pull origin main
   ```
2. Create or switch to the feature branch for this app work:
   ```bash
   git checkout japanese-portfolio-route
   ```
3. Rebase or merge the latest main into the feature branch before continuing:
   ```bash
   git rebase main
   ```
   or
   ```bash
   git merge main
   ```
4. Run the app build and verify the route still works on top of the updated main branch:
   ```bash
   npm install
   npm run build
   npm run dev
   ```
5. Push the branch after verifying:
   ```bash
   git push origin japanese-portfolio-route
   ```

This keeps the current portfolio updates intact, while making sure the `/Japanese` route work is built on the latest remote main state instead of an outdated base.

## Later merge into the existing portfolio

When attached under the same portfolio domain, keep this app under the `/Japanese` route and ensure the root portfolio site keeps working normally. The styling is self-contained and uses the provided Midnight & Amber tokens, so it can be embedded without looking like a separate product.

## Notes

- This uses a Sheets-only data store, which keeps the setup fully free for a small user base.
- If email is not configured, the UI will still work, but the email export route will return a clear configuration error.
- If anything is ambiguous, the app uses the simplest free option available.


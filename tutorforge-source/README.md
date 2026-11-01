# TutorForge ✳

**Teach with clarity.** TutorForge is a mobile-first, dark-only, local-first tutoring operations Progressive Web App (PWA), with no paid APIs or runtime dependencies.

## What the MVP includes

- Learner profiles, subjects, levels, exam boards, rates, and teaching notes.
- Lesson scheduling with date, start time, duration, custom hourly rate, objective, teaching activities, feedback, status and payment received.
- Homework assignment, due dates, submission/review status and marks.
- Dashboard showing upcoming lessons, homework workload and outstanding payments.
- Reports: hours taught, earnings/collections, and learner progress.
- GBP calculations in integer pence; transfers and invoices are not yet supported.
- Create/edit/delete with confirmation of cascading learner deletion.
- Manual JSON backup and restore; CSV export of sessions with spreadsheet-formula protection.
- Responsive desktop/mobile layout and installable offline-capable app shell.
- Explicitly fictional, opt-in demo dataset. No AI generation or API fees.

## Run locally

```bash
python3 -m http.server 8080 --directory site
```

Open http://localhost:8080 . Run tests with `npm run verify` (Node 22+).

## Deploy to GitHub Pages

Create a **separate public repository** named `tutorforge` under Empyrios and copy these files into its root. In **Settings → Pages**, select **GitHub Actions**. The included workflow runs validation and then publishes `site/`. On successful deployment the expected URL is `https://empyrios.github.io/tutorforge/`.

**This URL is not live until the independent repo is created and Pages successfully deploys.** Keep TutorForge as `building` in AppHub and do not add a launch button prematurely.

## Privacy, data protection and limitations

TutorForge **does not use authentication, encrypted-at-rest storage, remote sync, backups to the cloud, or user permissions**. Its current `localStorage` data is accessible to scripts on the same origin, is unencrypted, and can disappear if browser storage is cleared. Other `empyrios.github.io` project pages are on the same origin, despite using separate repositories. Export your own backups to a secure location.

**Do not use this MVP for real children's personal information, special educational needs, safeguarding notes, contact information or employer/student records** until a privacy and data-protection review has been completed and appropriate authentication, access control, storage security, retention/deletion controls, and hosting isolation are implemented. UK GDPR and educational safeguarding obligations may apply. The source code and demo contain only fictional people.

The MVP is not a billing/payment processor, synchronous shared tutor platform, AI lesson generator, attendance verification tool or statutory school management system. Scores are manually entered; average scores reflect only scored assignments, not all assessments. Lesson fees are rounded to pence using the configured rate and duration.

## Structure

`site/domain.mjs`: tested calculations, schema, safe CSV exports.
`site/app.mjs`: accessible browser app, forms, local storage and navigation.
`site/styles.css`: responsive dark UI.
`site/sw.js`: offline cache of *public* app shell only, no learner records.
`tests/domain.test.mjs`: logic and data validation tests.
`.github/workflows/deploy.yml`: CI and Pages deployment.

# Empyrios App Studio roadmap

Updated: 3 November 2026. This file records the build order; it is not a promise of dates or background work.

| Priority | App | Status | Next action |
|---:|---|---|---|
| 0 | Dayforge | Existing app | Maintain independently |
| 1 | DuoQuest | Deployed independently | Confirm migration data and close Dayforge redirect PR |
| 2 | WealthTrack | Deployed | Verify real-device use and refine the MVP |
| 3 | TutorForge | Deployed independently | Personal-data safeguards needed before real pupils |
| 4 | StudyForge | Deployed | Verify study flows on mobile; plan lecture imports |
| 5 | JobPilot | Deployed from AutoApply repo | Verify application tracking on mobile; consider renaming repository |
| 6 | LocalAI Lab | Deployed | Test custom hardware profiles and validate model estimates on real devices |
| 7 | Weave Lab | Standalone v1.1 research app deployed with passing CI | Build verified private v0.2 exact engine adapter for canonical 1,000-match runs; preserve provenance boundary |
| 8 | DealHunter | v1 source implemented and locally verified | Create standalone repository; configure Pages; verify deployment and AppHub launch |
| 9 | LifeOS | Planned | Integrate productivity features |
| 10 | TripCraft | Planned | Travel planning and budgets |
| 11 | CreatureLife | Planned | Original creature life simulation |

**Separation:** Each app is a distinct repository. AppHub is a launcher, not a monorepo.

**Publishing:** A passing test job is not proof that a site is live. Pages must be configured in each repository under Settings > Pages with Source = GitHub Actions before a deployment can publish.

**Privacy:** Financial, tutoring and study data should never be committed to source control. Browser-local storage should not be represented as encrypted or synced between devices. Do not put real banking credentials into WealthTrack.

**Current build:** Weave Lab is independently deployed, includes a versioned experiment runner and synthetic analysis, and has a successful latest CI deployment. The 1,000 canonical v0.2 study is blocked until the full roster engine adapter is validated. The current standalone app project is DealHunter, with verified local source and 31 automated unit tests; its GitHub repository and Pages deployment are pending. Next planned apps: LifeOS, TripCraft, CreatureLife.

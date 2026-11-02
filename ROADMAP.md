# Empyrios App Studio roadmap

Updated: 1 November 2026. This file records the build order; it is not a promise of dates or background work.

| Priority | App | Status | Next action |
|---:|---|---|---|
| 0 | Dayforge | Existing app | Maintain independently |
| 1 | DuoQuest | Deployed independently | Confirm migration data and close Dayforge redirect PR |
| 2 | WealthTrack | Deployed | Verify real-device use and refine the MVP |
| 3 | TutorForge | Deployed independently | Personal-data safeguards needed before real pupils |
| 4 | StudyForge | Deployed | Verify study flows on mobile; plan lecture imports |
| 5 | JobPilot | Deployed from AutoApply repo | Verify application tracking on mobile; consider renaming repository |
| 6 | LocalAI Lab | Standalone MVP tested, source staged | Create independent repository, enable Pages and verify deployment |
| 7 | CoachDesk | Planned | Learner operations |
| 8 | Weave Lab | Planned | Developer battle-testing tools |
| 9 | LifeOS | Planned | Integrate productivity features |
| 10 | TripCraft | Planned | Travel planning and budgets |
| 11 | DealHunter | Planned | Price tracking with permitted sources |
| 12 | CreatureLife | Planned | Original creature life simulation |

**Separation:** Each app is a distinct repository. AppHub is a launcher, not a monorepo.

**Publishing:** A passing test job is not proof that a site is live. Pages must be configured in each repository under Settings > Pages with Source = GitHub Actions before a deployment can publish.

**Privacy:** Financial, tutoring and study data should never be committed to source control. Browser-local storage should not be represented as encrypted or synced between devices. Do not put real banking credentials into WealthTrack.

**Current build:** LocalAI Lab v1 is implemented, passing 19 unit tests and browser interaction checks. The source is staged under a separate AppHub branch while an independent repository and Pages deployment are pending. The next planned project is CoachDesk.

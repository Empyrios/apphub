# Empyrios App Studio roadmap

Updated: 2 November 2026. This file records the build order; it is not a promise of dates or background work.

| Priority | App | Status | Next action |
|---:|---|---|---|
| 0 | Dayforge | Existing app | Maintain independently |
| 1 | DuoQuest | Deployed independently | Confirm migration data and close Dayforge redirect PR |
| 2 | WealthTrack | Deployed | Verify real-device use and refine the MVP |
| 3 | TutorForge | Deployed independently | Personal-data safeguards needed before real pupils |
| 4 | StudyForge | Deployed | Verify study flows on mobile; plan lecture imports |
| 5 | JobPilot | Deployed from AutoApply repo | Verify application tracking on mobile; consider renaming repository |
| 6 | LocalAI Lab | Deployed | Test custom hardware profiles and validate model estimates on real devices |
| 7 | Weave Lab | Advanced MVP implemented and tested, source staged | Create independent repository and enable Pages; integrate exact Weave engine adapter next |
| 8 | LifeOS | Planned | Integrate productivity features |
| 9 | TripCraft | Planned | Travel planning and budgets |
| 10 | DealHunter | Planned | Price tracking with permitted sources |
| 11 | CreatureLife | Planned | Original creature life simulation |

**Separation:** Each app is a distinct repository. AppHub is a launcher, not a monorepo.

**Publishing:** A passing test job is not proof that a site is live. Pages must be configured in each repository under Settings > Pages with Source = GitHub Actions before a deployment can publish.

**Privacy:** Financial, tutoring and study data should never be committed to source control. Browser-local storage should not be represented as encrypted or synced between devices. Do not put real banking credentials into WealthTrack.

**Current build:** Weave Lab v0.1 developer workbench has been implemented and passed 26 automated logic tests plus mobile/desktop browser flows. Its source is staged on an isolated AppHub branch, awaiting an independent repository and GitHub Pages. Priority after its release is an authoritative game-engine adapter; the battle proxy is not exact gameplay.

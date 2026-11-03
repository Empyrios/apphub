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
| 8 | DealHunter | v1.0 independently deployed with passing CI | Verify Android PWA and start authorised retailer-source evaluation |
| 9 | LifeOS | v1.0 source committed; 41 GitHub tests passed, Pages deployment blocked | Owner enables GitHub Actions under Settings → Pages, then reruns deployment |
| 11 | TripCraft | Deferred at owner request | No active work unless explicitly reactivated |
| 10 | CreatureLife | v1.0 committed to Empyrios/creaturelife; 56 GitHub CI tests passed, Pages deployment blocked | Owner enables GitHub Actions under Settings → Pages, then reruns failed deployment; verify published site before adding launch link |

**Separation:** Each app is a distinct repository. AppHub is a launcher, not a monorepo.

**Publishing:** A passing test job is not proof that a site is live. Pages must be configured in each repository under Settings > Pages with Source = GitHub Actions before a deployment can publish.

**Privacy:** Financial, tutoring and study data should never be committed to source control. Browser-local storage should not be represented as encrypted or synced between devices. Do not put real banking credentials into WealthTrack.

**Current build:** Weave Lab is independently deployed, includes a versioned experiment runner and synthetic analysis, and has a successful latest CI deployment. The 1,000 canonical v0.2 study is blocked until the full roster engine adapter is validated. DealHunter v1.0 is now deployed independently with passing GitHub Pages CI; price tracking currently uses manually recorded observations. LifeOS source is committed to Empyrios/lifeos with CI tests passing, but GitHub Pages requires owner enablement. CreatureLife v1.0 is committed to Empyrios/creaturelife, with all 56 GitHub CI tests passing. Pages publication is blocked pending owner enablement. Do not mark it deployed until an actual successful deploy run and live site are verified. TripCraft is explicitly deferred by the owner.

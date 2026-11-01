# Empyrios App Studio roadmap

Updated: 1 November 2026. This file records the build order; it is not a promise of dates or background work.

| Priority | App | Status | Next action |
|---:|---|---|---|
| 0 | Dayforge | Existing app | Maintain independently |
| 1 | DuoQuest | Deployed independently | Confirm migration data and close Dayforge redirect PR |
| 2 | WealthTrack | Standalone MVP code complete | Enable Pages, verify published app, then add launch link |
| 3 | StudyForge | Next build | Build study workspace with revision scheduling, flashcards and MCQ banks |
| 4 | JobPilot | Existing AutoApply project | Review existing repository, implement responsible application workflows |
| 5 | LocalAI Lab | Planned | Hardware and model compatibility |
| 6 | CoachDesk | Planned | Learner operations |
| 7 | Weave Lab | Planned | Developer battle-testing tools |
| 8 | LifeOS | Planned | Integrate productivity features |
| 9 | TripCraft | Planned | Travel planning and budgets |
| 10 | DealHunter | Planned | Price tracking with permitted sources |
| 11 | CreatureLife | Planned | Original creature life simulation |
| 12 | TutorForge | Deferred | Not part of the active build sequence |

**Separation:** Each app is a distinct repository. AppHub is a launcher, not a monorepo.

**Publishing:** A passing test job is not proof that a site is live. Pages must be configured in each repository under Settings > Pages with Source = GitHub Actions before a deployment can publish.

**Privacy:** Financial, tutoring and study data should never be committed to source control. Browser-local storage should not be represented as encrypted or synced between devices. Do not put real banking credentials into WealthTrack.

**Next build:** StudyForge, not TutorForge. TutorForge remains on the deferred backlog unless priorities change.

# Empyrios App Studio roadmap

Updated: 1 November 2026. This file records the build order; it is not a promise of dates or background work.

| Priority | App | Status | Next action |
|---:|---|---|---|
| 0 | Dayforge | Existing app | Maintain independently |
| 1 | DuoQuest | Deployed independently | Confirm migration data and close Dayforge redirect PR |
| 2 | WealthTrack | Deployed | Verify real-device use and refine the MVP |
| 3 | TutorForge | Deployed independently | Personal-data safeguards needed before real pupils |
| 4 | StudyForge | Independent repository, tests passing | Enable Pages and verify its deployment |
| 5 | JobPilot | v1 code built in AutoApply repo, tests passing | Enable Pages, verify site, consider renaming repo to JobPilot |
| 6 | LocalAI Lab | Planned | Hardware and model compatibility |
| 7 | CoachDesk | Planned | Learner operations |
| 8 | Weave Lab | Planned | Developer battle-testing tools |
| 9 | LifeOS | Planned | Integrate productivity features |
| 10 | TripCraft | Planned | Travel planning and budgets |
| 11 | DealHunter | Planned | Price tracking with permitted sources |
| 12 | CreatureLife | Planned | Original creature life simulation |

**Separation:** Each app is a distinct repository. AppHub is a launcher, not a monorepo.

**Publishing:** A passing test job is not proof that a site is live. Pages must be configured in each repository under Settings > Pages with Source = GitHub Actions before a deployment can publish.

**Privacy:** Financial, tutoring and study data should never be committed to source control. Browser-local storage should not be represented as encrypted or synced between devices. Do not put real banking credentials into WealthTrack.

**Current build:** StudyForge has moved to its independent repository; JobPilot v1 has been implemented in the existing AutoApply repository. Both await verified GitHub Pages deployment. The next planned app is LocalAI Lab.

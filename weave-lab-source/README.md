# Weave Lab · Advanced Combat Engineering Studio

**Standalone developer workbench, not the Weave game.** Local-first, dark-only and mobile-first. Zero runtime dependencies, npm + Node 22 for testing.

## Capabilities

- Two explicitly separated mechanical baselines: released Weave v0.1.2 versus approved provisional v0.2 trial.
- Full Gen1 Archive coverage: all 6 lines, 12 Base/Rewoven forms, 36 Art reference entries, provisional five-field stats and source links.
- 7×7 seeded Loom implementation with adjacency, group union, Cascades, gravity, refill, Thread Markers, dead-Loom reshuffle, Bonus Moves and replay export.
- Battle formula workbench with relevant Defence, conditional AP, separate bite hits, True Damage and Craglet/Cragkyl immunity, Shield application, target HP scaling and 40/50/65 sensitivity tests.
- 12-form damage matchup matrix, strict six-line snake draft, seeded Loom Monte Carlo experiments, transparent *simplified* 3v3 resource/damage projections and exported raw data.
- QA mapping to existing Linear issues and direct Notion/GitHub source references.

## Run locally

```sh
python3 -m http.server 8000 --directory site
# open http://localhost:8000
npm test
npm run check
```

Deploy GitHub Pages through **Settings → Pages → Source: GitHub Actions** after creating an independent public `weave-lab` repository. The deployment workflow publishes `site/` after tests pass.

## Data origin and baseline reconciliation

Reference material captured 2 November 2026:
- Weave `main` is released v0.1.2, which intentionally retained its *old single-Defence* and formula baseline.
- The current canonical Wiki specifies shared ATK, separate PHY.DEF / SP.DEF, damage = AP×ATK/(50 + relevant DEF), four-Thread Reweaving, 8 starting Thread Markers, 14 marker cap, 35% refill, and a minimum of six markers after each Move.
- This app models both, rather than falsely calling v0.2 implemented on Weave `main`.
- The complete game source is not imported; single-Art computations are transparent and the Loom model is **independently implemented**, not yet differential-tested against the authoritative engine.
- The 3v3 experiment is explicitly **a non-authoritative proxy**. It omits full status reactions, complete kit scripting, Taunt/Stealth, initiative advantages, exact timings and full PvP. It cannot establish actual win rates, match duration in minutes, or production balance.
- Historical damage mode averages the current Archive's two defence stats as an illustrative proxy. The original v0.1.2 stat tables are not faithfully reproduced in the calculator.
- Time targets (six Reweaves by minute 6, 8–10 minute matches) are goals, **not observed results**.

Sources: [Weave source](https://github.com/Empyrios/weave), [Canonical Combat](https://app.notion.com/p/3e43aaec5da18139857fd8a92a25e7df), [Loom rules](https://app.notion.com/p/3e43aaec5da18170923df4159d3a2f04), [Balance constants](https://app.notion.com/p/3e43aaec5da1819f90f8d75ebdf1f095), [Gen1 Archive rules](https://app.notion.com/p/3e43aaec5da1812cbda9edb2d946bcc4).

## Planned extensions

1. **Authoritative engine adapter**. Port game engine from separate private repository to an explicitly version-pinned shared simulation package, preserving determinism, replays and engine reports.
2. **v0.2 differential tests**. Run identical seeds, decisions and kit scripts through both game engine and laboratory; reject parity when state diverges.
3. **Proper large-scale simulations**. Web workers, matched seeds and policies, confidence intervals, first-player advantage, per-Weaver impact, cancellation, 8–10-minute timing captured from actual player decisions.
4. **Kit composition and scenario editing**. Safe experimental overrides, diff review, cherry-pick output, full temporal statuses, reaction queue, battle-log inspector and seeded failure minimisation.
5. **CI evidence**. Portable JSON reports, regression corpus, dashboards with release-commit SHA, distribution outliers and reproducible issue templates.

## Privacy

The app runs client-side. Current settings persist on one browser under `weavelab:settings:v1`; scenario and run exports download locally. No tokens, user identities, student records or secrets are requested. Don't commit personal/secret data to public repositories.

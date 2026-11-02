# LocalAI Lab ◈

A self-contained, dark-only, mobile-first **local AI model compatibility explorer**. It is an offline-capable Progressive Web App (PWA), with zero runtime libraries, zero AI API costs, no login and no backend.

## What you can do

- View 13 **curated Ollama model tags** across Qwen 3, Gemma 3, Llama 3.2 and Phi-4.
- Filter by coding, reasoning, vision, fast or everyday use; search and favourite models.
- Estimate GPU memory demand from published weights plus a *simplified* KV-cache and runtime allowance.
- Distinguish *estimated fully GPU loaded*, *hybrid offloading*, *CPU-only* and *high memory risk*.
- Customise VRAM, system RAM, GPU/CPU name and target context; compare four saved hardware presets.
- Compare up to three models, including their estimated weight, KV and runtime memory composition.
- Copy official Ollama CLI `ollama run ...`, `ollama ps` and `ollama list` commands.
- Export/import only **hardware preferences and model shortlist**, not any personal prompts.
- Install as a PWA on Android, Windows or other supported browsers.

## Reliability and caveats

The included static model catalog is a **snapshot verified 2026-11-02** from the official Ollama library. It does **not** update itself. Model tags and sizes may change. The app shows published download sizes in decimal GB but estimated running memory in GiB, a different measure.

Fit estimates use a broad heuristic, not a model-specific memory profiler. The KV cache estimate depends strongly on the model's architecture and attention implementation, and can differ significantly from these numbers. The heuristic assumes ~0.8 GiB of GPU VRAM is reserved for the desktop/system and ~3.5 GiB of system RAM is unavailable. Other memory overhead, batching, quantisation, model context, drivers, operating system, simultaneous apps and CPU/GPU layers can change actual results. **Never use this app as a guarantee that a model will run or a claim about token/s speeds.** Always test Ollama on the real machine.

The default **RTX 3070 (8GB)** hardware profile uses **16GB system RAM as an editable placeholder**, not a known fact about the user's PC. The example **32GB integrated laptop** is conservatively treated as CPU-only; unified-memory accelerators need specialised estimation not included here.

## Run locally

```bash
python3 -m http.server 8080 --directory site
# Visit http://localhost:8080
```

Run static and unit checks:

```bash
npm run verify
```

Browser interaction checks (optional, Chromium + Playwright for Python installed):

```bash
python tests/browser-check.py
```

The bundled Playwright browser test intentionally runs an in-memory module graph when loopback navigation is blocked in restricted environments. This verifies controls and interactions but does not replace a test of the deployed site.

## Deploy to GitHub Pages

1. Create a new **public** GitHub repository named `localai-lab` under `Empyrios`.
2. Commit these files to the repository's `main` branch.
3. Open **Settings → Pages → Build and deployment → Source**, select **GitHub Actions**.
4. Workflow `.github/workflows/deploy.yml` runs the unit/syntax checks and publishes `site/`.
5. Once the Pages deploy succeeds, the expected website is `https://empyrios.github.io/localai-lab/`.
6. Add the new URL to the AppHub catalog, not before publication.

## Data handling

No credentials, prompts, conversations, model downloads or user files are collected. Preferences are stored in `localStorage` under `empyrios-localai-lab-v1`, and exported settings require an explicit action. There are no runtime analytics, third-party fonts or API calls. Users can follow official source links from the Guide page.

**Browser-origin caveat:** GitHub Pages projects sharing `empyrios.github.io` share a browser origin. Their separate storage keys do not amount to a security boundary. Do not enter sensitive secrets into this app.

## Model sources

- [Qwen 3 models](https://ollama.com/library/qwen3)
- [Gemma 3 models](https://ollama.com/library/gemma3)
- [Llama 3.2 models](https://ollama.com/library/llama3.2)
- [Phi-4](https://ollama.com/library/phi4)

## Future improvements

Actual Ollama model runtime probe from a **local desktop companion** (with consent), precise architecture-specific KV estimates, quantisation tag selectors, benchmark upload/analysis, laptop GPU database, Apple Silicon unified memory profiles, and throughput testing. The current static GitHub Pages app intentionally does **not** open an insecure network endpoint into the user's PC.

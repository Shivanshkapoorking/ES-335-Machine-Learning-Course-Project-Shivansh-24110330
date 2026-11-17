# Forecasting a 21.5 MW solar plant, one week ahead

ES 335 Machine Learning course project. Shivansh Kapur, roll number 24110330 (solo).

Static website for GitHub Pages: open `index.html`, no build step. All numbers and plots on the site were read from the saved outputs of the three notebooks (Monsoon updated from the re-run notebook with all 16 runs finished) in `code/`.

## Layout
- `index.html`, `assets/` : the site (plain HTML, CSS, JavaScript)
- `data/results.js`, `data/results.json` : summary numbers parsed from the notebook outputs (metrics per run, greedy-search steps). No raw plant data.
- `img/` : forecast overlay plots exported from the notebook outputs (test week only)
- `code/` : the three season notebooks, outputs cleared

## Data
The SCADA data is proprietary (Power Systems and Smart Grid Laboratory, IIT Gandhinagar, shared with permission) and is NOT in this repository. See the "Reproduce this work" section of the site for the expected file names.

## Publish on GitHub Pages
1. Push this folder to a GitHub repository.
2. Settings, Pages, Source: "Deploy from a branch", branch `main`, folder `/ (root)`.
3. The site appears at `https://<your-username>.github.io/<repo-name>/`.

## Disclosure
The website was built with the help of Claude (Anthropic) from the saved notebook outputs. The author is responsible for the results.

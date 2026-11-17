# Forecasting a 21.5 MW solar plant, one Day ahead

ES 335 Machine Learning course project. Shivansh, roll number 24110330 (solo).

Static website for GitHub Pages: open `index.html`, no build step. All numbers and plots on the site were read from the saved outputs of the three notebooks (Monsoon updated from the re-run notebook with all 16 runs finished) in `code/`.

## Layout
- `index.html`, `assets/` : the site (plain HTML, CSS, JavaScript)
- `data/results.js`, `data/results.json` : summary numbers parsed from the notebook outputs (metrics per run, greedy-search steps). No raw plant data.
- `img/` : forecast overlay plots exported from the notebook outputs (test week only)
- `code/` : the three season notebooks, outputs cleared

## Data
The SCADA data is proprietary (Power Systems and Smart Grid Laboratory, IIT Gandhinagar, shared with permission) and is NOT in this repository. See the "Reproduce this work" section of the site for the expected file names.

## Website location
1. The site appears at `(https://shivanshkapoorking.github.io/ES-335-Machine-Learning-Course-Project-Shivansh-24110330/)`.

## Disclosure
The data preprocessing pipelines, feature engineering, machine learning modeling (XGBoost and Random Forest across Scenarios S1–S4), and evaluation metrics were designed and executed by the author. An AI assistant was used to help write and debug the Python scripts, format CSV deliverables, and structure this interactive website from the notebook outputs. The author verified all code logic, checked every metric and figure, and takes full responsibility for the final work.

# Week-Ahead Solar PV Generation Forecasting

**Course:** ES 335 – Machine Learning  
**Student:** Shivansh  
**Roll Number:** 24110330  
**Institution:** IIT Gandhinagar  
**Track:** Undergraduate – Individual Project

## Project Overview

This project investigates seven-day solar PV generation forecasting for a 21.5 MW utility-scale solar plant across Summer, Winter and Monsoon conditions.

It compares Random Forest and XGBoost models under four progressively expanded feature-information scenarios.

## Research Objectives

- Evaluate week-ahead forecasting performance across three seasonal conditions.
- Study how additional meteorological and physics-derived features influence prediction accuracy.
- Investigate forecasting errors and their relationship with observed weather conditions.

## Repository Structure

- `index.html` – Interactive project website.
- `code/` – Seasonal Jupyter notebooks.
- `final_deliverables/` – Exported forecasts, evaluation metrics and plots.
- `requirements.txt` – Python dependencies.

## Dataset

The project uses proprietary SCADA data obtained with permission from the Power Systems and Smart Grid Laboratory at IIT Gandhinagar.

Raw observations are not included in this public repository because of data confidentiality restrictions.

## Methodology

- Data cleaning and chronological partitioning.
- Temporal and meteorological feature engineering.
- Random Forest and XGBoost regression.
- Seasonal experiments and feature-selection analysis.
- Evaluation using regression and operational metrics.

## Reproducibility

1. Obtain the permitted dataset from its authorised source.
2. Prepare the seasonal training, validation and test CSV files using the documented schema.
3. Install the dependencies:

   `pip install -r requirements.txt`

4. Open the corresponding seasonal notebook.
5. Execute the notebook cells in order.
6. Find the generated forecasts, metrics and plots in the output directory.

## Interactive Website

Visit the published GitHub Pages website:

https://shivanshkapoorking.github.io/ES-335-Machine-Learning-Course-Project-Shivansh-24110330/

## Limitations

The study uses one test week per season and measured target-time weather in the weather-informed scenarios. Its findings should therefore be interpreted as an experimental comparison rather than a validated operational forecasting system.

## Responsible AI Use

AI assistance was used for coding, debugging, formatting and website development. All results and final project claims remain the responsibility of the author.

# Day-Ahead Solar PV Generation Forecasting

**Course:** ES 335 – Machine Learning  
**Student:** Shivansh (Roll No. 24110330), working solo  
**Institution:** IIT Gandhinagar  
**Track:** Undergraduate – Individual Project

Website: https://shivanshkapoorking.github.io/ES-335-Machine-Learning-Course-Project-Shivansh-24110330/

## Overview

This project forecasts the output of a 21.5 MW utility-scale solar PV plant one day ahead, at 15-minute resolution, and evaluates the forecasts over a seven-day test week in each of three seasons: Summer, Winter and Monsoon. It compares Random Forest and XGBoost under four progressively larger feature sets, and reports simple baselines alongside the models.

**Question:** How accurately can tree-based ensembles forecast day-ahead solar power for one plant, how does accuracy change as more information is given, and in what conditions do the forecasts fail?

**Target:** `Act. Power (MW)`, between 0 and 21.5 MW, one value per 15-minute step (96 per day).

## Scenarios

| Scenario | Information added | Features |
|---|---|---|
| S1 | Calendar encodings and past power (previous day, same day last week, average of the same slot over days 7 to 13) | 7 |
| S2 | Measured weather at the target time (irradiance, module and air temperature, wind) | 13 |
| S3 | Physics-derived features (temperature difference, heat-corrected irradiance, wind cooling proxy) | 16 |
| S4 | Solar geometry and clear-sky estimates | 22 |

Each scenario is run with all features and with greedy forward-selected features, for both models, with five fixed revisions of each (16 setups per season, 48 in total, 240 fitted models).

Baselines: persistence (same slot yesterday) and the mean of the same slot over the previous seven days.

## Evaluation design

- Chronological split per season: training, then validation, then a seven-day test week. Nothing is shuffled.
- Training fits the models and the one learned preprocessing constant (`k_plant`).
- Validation drives XGBoost early stopping and the greedy feature search.
- The test week is used only to report final numbers.
- Metrics: MAE, RMSE, daytime MAE and MAPE, mean bias, R², and the share of 15-minute blocks within ±7% of plant capacity.

## Repository structure

- `index.html`, `assets/`, `data/`, `img/` – the interactive website (plain HTML, CSS and JavaScript, no build step). `data/` holds summary numbers parsed from the notebook outputs, and `img/` holds the forecast plots for the test weeks.
- `code/` – one Jupyter notebook per season, with outputs cleared.
- `final_deliverables/` – forecasts, metrics and plots produced when a notebook is run.
- `requirements.txt` – Python dependencies.

## Data

The project uses proprietary SCADA data from a 21.5 MW grid-connected plant, shared with permission by the Power Systems and Smart Grid Laboratory, IIT Gandhinagar. Raw observations are not in this repository.

Expected columns: `TimeStamp`, `Act. Power (MW)`, `W-GHI (W/m2)`, `W-MODT- (°C)`, `W-AMBT (°C)`, `W-WSPD (m/s)`, `W-WDIR- (Degree)`.

Expected file names:

```
Summer:  Summer_Training.csv, Summer_Validation.csv, Summer_Testing.csv
Winter:  Winter_Dataset_Train.csv, Validation_Dataset_Winter.csv, Testing_Dataset_Winter.csv
Monsoon: Monsoon_Train.csv, Monsoon_Validation.csv, Monsoon_test.csv
```

Test weeks: Summer 8–14 June 2026, Winter 8–14 February 2026, Monsoon 8–14 October 2025.

## Reproduce

1. Obtain the data from its authorised source and create one training, validation and test CSV per season with the columns and names above.
2. Install dependencies: `pip install -r requirements.txt`
3. Open one season's notebook in `code/` and run all cells. Set the season name and file names in the first cells. The greedy searches dominate the run time, at about 12 to 15 minutes per season.
4. Outputs are written to `final_deliverables/`. Random seeds are fixed in the revision settings.

## Limitations

- **Submission time.** The forecast is treated as issued at [HH:MM] on the previous day. The previous-day power feature (`lag_1d`) uses the full previous day in the saved runs, so slots after the submission time may be slightly optimistic. [A strict variant that respects the submission time is reported on the website / was not run.]
- **Measured, not forecast, weather.** S2 to S4 use the weather measured at the target time, which assumes a perfect weather forecast. Results are a best case.
- **One test week per season.** There are no confidence intervals. The spread between revisions of the same model is the only uncertainty shown.
- **Seasons are modelled separately.** Nothing here shows transfer to another season or another plant.
- **No causal claims.** A feature that helps prediction is not shown to cause higher output.

These results are an experimental comparison, not a validated operational forecasting system.

## Responsible AI use

An AI assistant (Claude) was used to help write and debug code, format outputs, and build the website from the saved notebook results. The author designed the experiments, checked the results, and is responsible for all claims in this project.

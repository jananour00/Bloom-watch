# TODO: Integrate NASA APIs and Visualizations for Bloom-Watch

## Step 1: Update Dependencies
- [x] Add 'plotly' to backend/requirements.txt for potential backend chart generation.

## Step 2: Update Backend (app.py)
- [x] Fix CSV path to "NDVI_TimeSeries_CentralValley (2).csv".
- [x] Create 'date' column from month/year in NDVI CSV.
- [x] Add /climate endpoint to fetch daily climate data from NASA POWER API.
- [x] Add /data endpoint to return NDVI historical data as JSON.
- [x] Enhance /predict endpoint to accept climate inputs for better forecasts.
- [x] Add /ndvi endpoint to fetch NDVI data from NASA POWER API.
- [x] Add /evi endpoint to fetch EVI data from NASA POWER API.
- [x] Add /soil_moisture endpoint to fetch soil moisture from NASA POWER API.
- [x] Add /chart endpoint to generate Plotly chart for NDVI and return HTML.

## Step 3: Create Fetch Script
- [x] Create backend/fetch_nasa_data.py script for optional NDVI fetching from MODIS (requires Earthdata token) and climate batch processing.

## Step 4: Update Frontend (Storytelling.jsx)
- [x] Move all charts from Data.jsx to Storytelling.jsx.
- [x] Add NDVI time series line chart.
- [x] Add multi-line chart (NDVI + climate variables).
- [x] Add seasonal bar chart (average NDVI by month).
- [x] Add heatmap scatter (NDVI vs precipitation).
- [x] Add forecast plot (observed + predicted NDVI).
- [x] Add bar chart (cumulative precipitation/solar radiation).
- [x] Add map heatmap for South/North California NDVI.
- [x] Add slider for bloom/time selection.
- [x] Add summary/description related to model.
- [x] Add climate data charts (temp, rainfall, humidity, solar).
- [x] Improve UI with better CSS styling and grid layout.
- [x] Add EVI time series chart.
- [x] Add soil moisture chart.

## Step 5: Followup
- [x] Install/update dependencies with pip install -r requirements.txt.
- [x] Test NASA POWER API fetch in backend.
- [x] Run Flask app and verify endpoints.
- [x] Test frontend charts with fetched data.
- [x] Test new NASA API routes.
- [x] Update frontend with new charts.
- [ ] If needed, run fetch_nasa_data.py to update NDVI CSV.

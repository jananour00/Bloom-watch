# BloomWatch - NDVI Forecasting MVP

This is a ready-to-run mini project to fetch sample NDVI data, train a bloom forecasting model, and serve predictions via a FastAPI backend with a simple Leaflet frontend.

## Quick Run Instructions

1. **Clone/setup files** into a directory (e.g., `bloomwatch/`).
2. **Create Python environment**:
   ```bash
   python -m venv venv
   source venv/bin/activate  # or venv\Scripts\activate on Windows
   pip install -r requirements.txt
   ```
3. **Authenticate Google Earth Engine** (one-time):
   - Sign up at [earthengine.google.com](https://earthengine.google.com) if needed.
   - Install Earth Engine CLI: `pip install earthengine-api`
   - Run `earthengine authenticate` and follow prompts.
4. **Fetch NDVI data**:
   ```bash
   python scripts/fetch_ndvi_gee.py
   ```
   This downloads monthly NDVI GeoTIFFs for the Cairo region (2022-2023) to `data/ndvi/`.
5. **Compute features**:
   ```bash
   python scripts/compute_features.py
   ```
   Creates `data/features_timeseries.csv` with ML features per cell/month.
6. **Train model**:
   ```bash
   python scripts/train_xgb.py
   ```
   Trains XGBoost classifier and saves to `models/xgb_model.joblib`.
7. **Start backend**:
   ```bash
   uvicorn backend.app:app --host 0.0.0.0 --port 8000
   ```
8. **Open frontend**:
   - Open `frontend/index.html` in a browser (or serve via `python -m http.server 8080` from `frontend/`).
   - Click the map to query predictions.

## Dependencies

- **System packages**: GDAL (for rasterio). Install via `apt install gdal-bin libgdal-dev` (Ubuntu) or equivalent.
- **Python packages**: See `requirements.txt`.

## Environment Variables

Copy `.env.example` to `.env` and set:
- `GEE_PROJECT`: Your Google Earth Engine project ID.
- `DATA_DIR`: `./data`
- `MODEL_PATH`: `./models/xgb_model.joblib`

## Troubleshooting

- **GEE auth issues**: Ensure `earthengine authenticate` was run and project is set.
- **Large regions**: Reduce `BBOX` in `fetch_ndvi_gee.py` or use Earth Engine Export to Drive.
- **Memory**: For large rasters, increase `stride` in `compute_features.py`.
- **Model weak**: Add more data or features (e.g., climate covariates).

## Production Notes

- Replace point sampling with precomputed tiles for faster queries.
- Add caching (Redis) for predictions.
- Include climate data (NASA POWER) in features.
- Add SHAP explanations for model interpretability.
https://drive.google.com/file/d/1lB082qf58nR4U5wNMaXb_MniMjC5-dzG/view?usp=sharing

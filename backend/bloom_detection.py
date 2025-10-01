# bloom_detection.py
import os
from pathlib import Path
import numpy as np
import pandas as pd
from utils import fetch_power_point, build_features_from_df
from sklearn.cluster import KMeans
from sklearn.preprocessing import StandardScaler
import joblib
import warnings
warnings.filterwarnings("ignore")

DATA_DIR = Path(os.environ.get("DATA_DIR", "./data"))
MODELS_DIR = Path(os.environ.get("MODELS_DIR", "./models"))
DATA_DIR.mkdir(parents=True, exist_ok=True)
MODELS_DIR.mkdir(parents=True, exist_ok=True)

# Configuration
n_samples = 50  # fewer for demo
np.random.seed(42)

lon_min, lon_max = -10, 40
lat_min, lat_max = 20, 38

all_X = []
scaler = StandardScaler()

for i in range(n_samples):
    lat = np.random.uniform(lat_min, lat_max)
    lon = np.random.uniform(lon_min, lon_max)
    try:
        df_daily = fetch_power_point(lat, lon, "20170101", "20231231")
    except KeyboardInterrupt:
        print("Interrupted by user")
        break
    except Exception as e:
        print("Fetch failed for", lat, lon, ":", str(e))
        continue
    feat = build_features_from_df(df_daily, n_lags=3)  # fewer lags for clustering
    df_feat = feat.dropna(axis=0, how='any')
    if df_feat.shape[0] < 6:
        continue
    X = df_feat.values
    all_X.append(X)

if len(all_X) == 0:
    raise SystemExit("No samples collected.")

# Concatenate
X_all = np.vstack(all_X)
print("Clustering data shape:", X_all.shape)

# Scale
X_scaled = scaler.fit_transform(X_all)

# K-Means for 4 clusters: no bloom, early, peak, late
kmeans = KMeans(n_clusters=4, random_state=42, n_init=10)
clusters = kmeans.fit_predict(X_scaled)

# Save model
model_path = MODELS_DIR / "bloom_clustering.joblib"
joblib.dump({"kmeans": kmeans, "scaler": scaler, "feature_columns": list(feat.columns)}, model_path)
print("Saved clustering model to", model_path)

# Quick eval: cluster sizes
unique, counts = np.unique(clusters, return_counts=True)
print("Cluster sizes:", dict(zip(unique, counts)))

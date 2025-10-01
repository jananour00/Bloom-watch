# desertification_model.py
import os
from pathlib import Path
import numpy as np
import pandas as pd
from utils import fetch_power_point, build_features_from_df
from sklearn.ensemble import RandomForestClassifier
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import StandardScaler
import joblib
import warnings
warnings.filterwarnings("ignore")

DATA_DIR = Path(os.environ.get("DATA_DIR", "./data"))
MODELS_DIR = Path(os.environ.get("MODELS_DIR", "./models"))
DATA_DIR.mkdir(parents=True, exist_ok=True)
MODELS_DIR.mkdir(parents=True, exist_ok=True)

def create_desertification_label(monthly_df, soil_col="GWETPROF_t", temp_col="T2M_t", precip_col="PRECTOT_t"):
    """
    Label for desertification risk: 1 if soil moisture low and temp high and precip low.
    """
    df = monthly_df.copy()
    if soil_col not in df.columns:
        df[soil_col] = 0.5
    if temp_col not in df.columns:
        df[temp_col] = 20.0
    if precip_col not in df.columns:
        df[precip_col] = 10.0

    # Risk if soil moisture < 0.3 and temp > 25 and precip < median
    cond_risk = (df[soil_col] < 0.3) & (df[temp_col] > 25) & (df[precip_col] < df[precip_col].median())
    label = cond_risk.astype(int)
    return label

# Configuration
n_samples = 50
np.random.seed(42)

lon_min, lon_max = -10, 40
lat_min, lat_max = 20, 38

all_X = []
all_y = []
feature_columns = None

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
    feat = build_features_from_df(df_daily, n_lags=3)
    label = create_desertification_label(feat)
    df_feat = feat.copy()
    df_feat["label"] = label
    df_feat = df_feat.dropna(axis=0, how='any')
    if df_feat.shape[0] < 6:
        continue
    X = df_feat.drop(columns=["label"])
    y = df_feat["label"].astype(int)
    if feature_columns is None:
        feature_columns = list(X.columns)
    all_X.append(X.values)
    all_y.append(y.values)

if len(all_X) == 0:
    raise SystemExit("No samples collected.")

X_all = np.vstack(all_X)
y_all = np.concatenate(all_y)

print("Desertification data shape:", X_all.shape, y_all.shape)

X_train, X_test, y_train, y_test = train_test_split(X_all, y_all, test_size=0.2, random_state=42, stratify=y_all)

rf = RandomForestClassifier(n_estimators=100, random_state=42)
rf.fit(X_train, y_train)

# Save
model_path = MODELS_DIR / "desertification_rf.joblib"
joblib.dump({"rf": rf, "feature_columns": feature_columns}, model_path)
print("Saved desertification model to", model_path)

# Eval
acc = rf.score(X_test, y_test)
print("Test Accuracy:", acc)

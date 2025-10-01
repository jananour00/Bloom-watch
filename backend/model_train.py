# model_train.py
import os
from pathlib import Path
import numpy as np
import pandas as pd
from utils import fetch_power_point, build_features_from_df, create_synthetic_label_from_monthly
from sklearn.model_selection import train_test_split
import xgboost as xgb
import joblib
import warnings
warnings.filterwarnings("ignore")

DATA_DIR = Path(os.environ.get("DATA_DIR", "./data"))
MODELS_DIR = Path(os.environ.get("MODELS_DIR", "./models"))
DATA_DIR.mkdir(parents=True, exist_ok=True)
MODELS_DIR.mkdir(parents=True, exist_ok=True)

# Configuration
years = list(range(2018, 2024))  # sample years
n_samples = 120  # number of random spatial samples (for demo - increase for real models)
np.random.seed(42)

# We'll sample random points within a bounding box (global or a region)
# Example: North Africa bbox (lon_min, lon_max, lat_min, lat_max)
lon_min, lon_max = -10, 40
lat_min, lat_max = 20, 38

all_X = []
all_y = []
feature_columns = None

for i in range(n_samples):
    lat = np.random.uniform(lat_min, lat_max)
    lon = np.random.uniform(lon_min, lon_max)
    # fetch multi-year daily data for this point
    # request from 2017-01-01 to 2023-12-31 to get multiple years of months
    try:
        df_daily = fetch_power_point(lat, lon, "20170101", "20231231")
    except KeyboardInterrupt:
        print("Interrupted by user")
        break
    except Exception as e:
        print("Fetch failed for", lat, lon, ":", str(e))
        continue
    feat = build_features_from_df(df_daily, n_lags=6)
    # Create synthetic label (binary)
    label = create_synthetic_label_from_monthly(feat, temp_col="T2M_t", precip_col="PRECTOT_t")
    # Align and drop NaNs
    df_feat = feat.copy()
    df_feat["label"] = label
    df_feat = df_feat.dropna(axis=0, how='any')
    if df_feat.shape[0] < 12:
        continue
    X = df_feat.drop(columns=["label"])
    y = df_feat["label"].astype(int)
    if feature_columns is None:
        feature_columns = list(X.columns)
    all_X.append(X.values)
    all_y.append(y.values)

# Concatenate samples (time-series samples) vertically
if len(all_X) == 0:
    raise SystemExit("No samples collected - adjust sampling or API calls.")

X_all = np.vstack(all_X)
y_all = np.concatenate(all_y)

print("Total samples:", X_all.shape, y_all.shape)

# Train/test split
X_train, X_test, y_train, y_test = train_test_split(X_all, y_all, test_size=0.2, random_state=42, stratify=y_all)

dtrain = xgb.DMatrix(X_train, label=y_train)
dtest  = xgb.DMatrix(X_test, label=y_test)

params = {
    "objective": "multi:softprob",
    "num_class": 4,  # 0=no bloom, 1=early, 2=peak, 3=late
    "eval_metric": "mlogloss",
    "eta": 0.05,
    "max_depth": 6,
    "subsample": 0.7,
    "colsample_bytree": 0.6,
    "seed": 42
}
evallist = [(dtrain, "train"), (dtest, "eval")]
num_boost_round = 500
bst = xgb.train(params, dtrain, num_boost_round=num_boost_round, evals=evallist, early_stopping_rounds=25, verbose_eval=25)

# Save model and metadata
model_path = MODELS_DIR / "bloom_model.joblib"
joblib.dump({"model":bst, "feature_columns": feature_columns}, model_path)
print("Saved model to", model_path)

# quick evaluation
preds = bst.predict(dtest)  # shape (n_samples, 4) probabilities
pred_labels = np.argmax(preds, axis=1)  # predicted class
from sklearn.metrics import classification_report, accuracy_score
acc = accuracy_score(y_test, pred_labels)
print("Test Accuracy:", acc)
unique_labels = np.unique(y_test)
num_classes = len(unique_labels)
target_names = ['No Bloom', 'Early Bloom', 'Peak Bloom', 'Late Bloom'][:num_classes]
print(classification_report(y_test, pred_labels, labels=unique_labels, target_names=target_names))

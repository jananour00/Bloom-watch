# forecasting_model.py
import os
from pathlib import Path
import numpy as np
import pandas as pd
from utils import fetch_power_point, build_features_from_df
from sklearn.preprocessing import MinMaxScaler
from tensorflow.keras.models import Sequential
from tensorflow.keras.layers import LSTM, Dense
import joblib
import warnings
warnings.filterwarnings("ignore")

DATA_DIR = Path(os.environ.get("DATA_DIR", "./data"))
MODELS_DIR = Path(os.environ.get("MODELS_DIR", "./models"))
DATA_DIR.mkdir(parents=True, exist_ok=True)
MODELS_DIR.mkdir(parents=True, exist_ok=True)

def create_sequences(data, seq_length=12):
    X, y = [], []
    for i in range(len(data) - seq_length):
        X.append(data[i:i+seq_length])
        y.append(data[i+seq_length])
    return np.array(X), np.array(y)

# Configuration
n_samples = 20  # fewer for LSTM
seq_length = 12  # 12 months history
np.random.seed(42)

lon_min, lon_max = -10, 40
lat_min, lat_max = 20, 38

all_sequences = []

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
    df_feat = feat.dropna(axis=0, how='any')
    if df_feat.shape[0] < seq_length + 1:
        continue
    # Forecast T2M_t
    data = df_feat["T2M_t"].values.reshape(-1, 1)
    scaler = MinMaxScaler()
    data_scaled = scaler.fit_transform(data)
    X, y = create_sequences(data_scaled, seq_length)
    all_sequences.append((X, y, scaler))

if len(all_sequences) == 0:
    raise SystemExit("No sequences collected.")

# Concatenate
X_all = np.vstack([seq[0] for seq in all_sequences])
y_all = np.vstack([seq[1] for seq in all_sequences])
scaler = all_sequences[0][2]  # use first scaler

print("Forecasting data shape:", X_all.shape, y_all.shape)

# LSTM model
model = Sequential()
model.add(LSTM(50, activation='relu', input_shape=(seq_length, 1)))
model.add(Dense(1))
model.compile(optimizer='adam', loss='mse')

model.fit(X_all, y_all, epochs=20, batch_size=32, verbose=1)

# Save
model_path = MODELS_DIR / "forecasting_lstm.joblib"
joblib.dump({"lstm": model, "scaler": scaler, "seq_length": seq_length}, model_path)
print("Saved forecasting model to", model_path)

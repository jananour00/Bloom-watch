# utils.py
import requests
from requests.adapters import HTTPAdapter
from urllib3.util.retry import Retry
import pandas as pd
import numpy as np
from datetime import datetime, timedelta

POWER_URL = "https://power.larc.nasa.gov/api/temporal/daily/point"

def fetch_power_point(lat, lon, start, end, parameters=None):
    """
    Fetch NASA POWER daily data for a single point.
    start, end = 'YYYYMMDD' strings
    parameters = list of parameter short names (T2M, PRECTOT, etc.)
    Returns pandas DataFrame with date index and columns = parameters
    """
    if parameters is None:
        parameters = ["T2M", "PRECTOT", "ALLSKY_SFC_SW_DWN", "RH2M", "GWETPROF", "GWETROOT"]
    params = {
        "start": start,
        "end": end,
        "latitude": lat,
        "longitude": lon,
        "community": "AG",   # agriculture community (useful defaults)
        "parameters": ",".join(parameters),
        "format": "JSON"
    }
    # Set up retry strategy
    retry_strategy = Retry(
        total=3,
        status_forcelist=[429, 500, 502, 503, 504],
        backoff_factor=1
    )
    adapter = HTTPAdapter(max_retries=retry_strategy)
    with requests.Session() as session:
        session.mount("https://", adapter)
        r = session.get(POWER_URL, params=params, timeout=60)
        r.raise_for_status()
        j = r.json()
    data = j["properties"]["parameter"]
    # Transform into dataframe
    df = pd.DataFrame(data)
    df.index = pd.to_datetime(df.index, format="%Y%m%d")
    df.index.name = "date"
    # Convert to numeric and handle missing
    df = df.apply(pd.to_numeric, errors='coerce')
    return df

def build_features_from_df(df, n_lags=6):
    """
    Build features (lags, rolling stats, amplitude, month sin/cos) from daily df.
    df: daily DataFrame indexed by date with columns (T2M, PRECTOT, ...).
    We'll aggregate to monthly features (mean) to match monthly forecasting.
    """
    # Resample to monthly mean
    monthly = df.resample('M').mean()
    monthly = monthly.sort_index()
    # Create lags for each variable
    feat = pd.DataFrame(index=monthly.index)
    for col in monthly.columns:
        feat[f"{col}_t"] = monthly[col]
        for lag in range(1, n_lags+1):
            feat[f"{col}_lag{lag}"] = monthly[col].shift(lag)
    # Rolling stats (3,6 months)
    for col in monthly.columns:
        feat[f"{col}_rollmean3"] = monthly[col].rolling(3, min_periods=1).mean()
        feat[f"{col}_rollstd6"] = monthly[col].rolling(6, min_periods=1).std()
    # amplitude (max-min) over last 12 months
    for col in monthly.columns:
        feat[f"{col}_amp12"] = monthly[col].rolling(12, min_periods=1).apply(lambda x: np.nanmax(x)-np.nanmin(x))
    # month cyclical
    feat["month"] = feat.index.month
    feat["month_sin"] = np.sin(2*np.pi*feat["month"]/12)
    feat["month_cos"] = np.cos(2*np.pi*feat["month"]/12)
    feat = feat.drop(columns=["month"])
    return feat

def create_synthetic_label_from_monthly(monthly_df, temp_col="T2M_t", precip_col="PRECTOT_t"):
    """
    Create a multi-class label for bloom stages: 0=no bloom, 1=early bloom, 2=peak bloom, 3=late bloom.
    Based on temperature and precipitation heuristics.
    Returns pandas Series aligned to same index (label for next month).
    """
    df = monthly_df.copy()
    if temp_col not in df.columns:
        df[temp_col] = 20.0
    if precip_col not in df.columns:
        df[precip_col] = 10.0

    # Define conditions for stages
    temp = df[temp_col]
    if f"{precip_col}_rollmean3" in df.columns:
        precip_3 = df[f"{precip_col}_rollmean3"]
    else:
        precip_3 = df[precip_col].rolling(3, min_periods=1).mean()

    # Heuristic for bloom stages based on temp and precip
    # 0: no bloom (cold or dry)
    # 1: early bloom (warming up, moderate precip)
    # 2: peak bloom (optimal temp and precip)
    # 3: late bloom (cooling down)

    label = pd.Series(0, index=df.index)  # default no bloom

    # Early bloom: temp 10-20, precip moderate
    cond_early = (temp >= 10) & (temp < 20) & (precip_3 > precip_3.quantile(0.3))
    label[cond_early] = 1

    # Peak bloom: temp 15-25, precip high
    cond_peak = (temp >= 15) & (temp <= 25) & (precip_3 > precip_3.quantile(0.6))
    label[cond_peak] = 2

    # Late bloom: temp 20-30, precip decreasing
    cond_late = (temp > 20) & (temp <= 30) & (precip_3 <= precip_3.quantile(0.7))
    label[cond_late] = 3

    # Shift to next month prediction
    label = label.shift(-1)
    label = label.fillna(0).astype(int)
    return label
